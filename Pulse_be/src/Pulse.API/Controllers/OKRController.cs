using Microsoft.AspNetCore.Authorization;
using Pulse.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Strategy;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/objectives")]
[Authorize]
[RequireWorkspaceMember]
public class OKRController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public OKRController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(string workspaceSlug, [FromQuery] string? period)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var query = _db.Objectives
            .Where(o => o.WorkspaceId == workspace.Id && o.ParentObjectiveId == null);
        if (!string.IsNullOrEmpty(period))
            query = query.Where(o => o.Period == period);

        var objectives = await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id, o.Title, o.Description, o.Period, o.Status, o.Progress, o.StartDate, o.EndDate,
                Owner = new { o.Owner.Id, o.Owner.FirstName, o.Owner.LastName },
                KeyResults = o.KeyResults.Select(kr => new
                {
                    kr.Id, kr.Title, kr.MetricType, kr.StartValue, kr.TargetValue, kr.CurrentValue, kr.Progress, kr.Unit,
                    Owner = new { kr.Owner.Id, kr.Owner.FirstName, kr.Owner.LastName }
                }).ToList()
            })
            .ToListAsync();
        return Ok(objectives);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string workspaceSlug, [FromBody] CreateObjectiveRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var objective = new Objective
        {
            WorkspaceId = workspace.Id,
            OwnerId = userId,
            Title = req.Title,
            Description = req.Description,
            Period = req.Period,
            StartDate = req.StartDate.HasValue ? DateTime.SpecifyKind(req.StartDate.Value, DateTimeKind.Utc) : null,
            EndDate = req.EndDate.HasValue ? DateTime.SpecifyKind(req.EndDate.Value, DateTimeKind.Utc) : null,
            Status = req.Status ?? OKRStatus.Active
        };
        _db.Objectives.Add(objective);
        await _db.SaveChangesAsync();
        return Ok(new { objective.Id, objective.Title, objective.Period, objective.Status });
    }

    [HttpPost("{objectiveId}/key-results")]
    public async Task<IActionResult> AddKeyResult(string workspaceSlug, Guid objectiveId, [FromBody] CreateKeyResultRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var kr = new KeyResult
        {
            ObjectiveId = objectiveId,
            OwnerId = userId,
            Title = req.Title,
            MetricType = req.MetricType,
            StartValue = req.StartValue,
            TargetValue = req.TargetValue,
            CurrentValue = req.StartValue,
            Unit = req.Unit
        };
        _db.KeyResults.Add(kr);
        await _db.SaveChangesAsync();
        return Ok(new { kr.Id, kr.Title, kr.MetricType, kr.StartValue, kr.TargetValue, kr.CurrentValue, kr.Unit });
    }

    [HttpPut("key-results/{krId}/check-in")]
    public async Task<IActionResult> CheckIn(string workspaceSlug, Guid krId, [FromBody] CheckInRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var kr = await _db.KeyResults.FindAsync(krId);
        if (kr == null) return NotFound();

        var checkIn = new OKRCheckIn
        {
            KeyResultId = krId,
            AuthorId = userId,
            PreviousValue = kr.CurrentValue,
            NewValue = req.NewValue,
            Note = req.Note,
            Confidence = req.Confidence
        };
        _db.OKRCheckIns.Add(checkIn);

        kr.CurrentValue = req.NewValue;
        var range = kr.TargetValue - kr.StartValue;
        kr.Progress = range != 0 ? Math.Round((kr.CurrentValue - kr.StartValue) / range * 100, 1) : 0;

        // Update objective progress
        var objective = await _db.Objectives.Include(o => o.KeyResults).FirstOrDefaultAsync(o => o.Id == kr.ObjectiveId);
        if (objective != null && objective.KeyResults.Count > 0)
        {
            objective.Progress = Math.Round(objective.KeyResults.Average(k => k.Progress), 1);
        }

        await _db.SaveChangesAsync();
        return Ok(new { kr.CurrentValue, kr.Progress, ObjectiveProgress = objective?.Progress });
    }

    [HttpDelete("{objectiveId}")]
    public async Task<IActionResult> DeleteObjective(string workspaceSlug, Guid objectiveId)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var objective = await _db.Objectives.Include(o => o.KeyResults).FirstOrDefaultAsync(o => o.Id == objectiveId && o.WorkspaceId == workspace.Id);
        if (objective == null) return NotFound();

        _db.KeyResults.RemoveRange(objective.KeyResults);
        _db.Objectives.Remove(objective);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{objectiveId}")]
    public async Task<IActionResult> UpdateObjective(string workspaceSlug, Guid objectiveId, [FromBody] UpdateObjectiveRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var objective = await _db.Objectives.FirstOrDefaultAsync(o => o.Id == objectiveId && o.WorkspaceId == workspace.Id);
        if (objective == null) return NotFound();

        if (req.Title != null) objective.Title = req.Title;
        if (req.Description != null) objective.Description = req.Description;
        if (req.Period != null) objective.Period = req.Period;
        if (req.Status.HasValue) objective.Status = req.Status.Value;
        if (req.StartDate.HasValue) objective.StartDate = DateTime.SpecifyKind(req.StartDate.Value, DateTimeKind.Utc);
        if (req.EndDate.HasValue) objective.EndDate = DateTime.SpecifyKind(req.EndDate.Value, DateTimeKind.Utc);

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("key-results/{krId}")]
    public async Task<IActionResult> DeleteKeyResult(string workspaceSlug, Guid krId)
    {
        var kr = await _db.KeyResults.FindAsync(krId);
        if (kr == null) return NotFound();

        var objectiveId = kr.ObjectiveId;
        _db.KeyResults.Remove(kr);

        // Recompute objective progress
        var objective = await _db.Objectives.Include(o => o.KeyResults).FirstOrDefaultAsync(o => o.Id == objectiveId);
        if (objective != null && objective.KeyResults.Count > 1) // > 1 because kr is still in the list conceptually or we check after save but we can compute excluding this kr
        {
            var otherKrs = objective.KeyResults.Where(k => k.Id != krId).ToList();
            objective.Progress = otherKrs.Any() ? Math.Round(otherKrs.Average(k => k.Progress), 1) : 0;
        }
        else if (objective != null)
        {
            objective.Progress = 0;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateObjectiveRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Period { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public OKRStatus? Status { get; set; }
}

public class CreateKeyResultRequest
{
    public string Title { get; set; } = string.Empty;
    public OKRMetricType MetricType { get; set; } = OKRMetricType.Percentage;
    public decimal StartValue { get; set; }
    public decimal TargetValue { get; set; } = 100;
    public string? Unit { get; set; }
}

public class CheckInRequest
{
    public decimal NewValue { get; set; }
    public string? Note { get; set; }
    public OKRConfidence Confidence { get; set; } = OKRConfidence.OnTrack;
}

public class UpdateObjectiveRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Period { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public OKRStatus? Status { get; set; }
}
