using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Analytics;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class TimeTrackingController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public TimeTrackingController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("tasks/{taskId}/time-entries")]
    public async Task<IActionResult> GetTaskTimeEntries(string workspaceSlug, Guid taskId)
    {
        var entries = await _db.TimeEntries
            .Where(t => t.TaskId == taskId)
            .OrderByDescending(t => t.StartTime)
            .Select(t => new
            {
                t.Id, t.Note, t.StartTime, t.EndTime, t.DurationMinutes, t.IsRunning,
                User = new { t.User.Id, t.User.FirstName, t.User.LastName }
            })
            .ToListAsync();
        return Ok(entries);
    }

    [HttpPost("tasks/{taskId}/time-entries")]
    public async Task<IActionResult> LogTime(string workspaceSlug, Guid taskId, [FromBody] LogTimeRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var startUtc = DateTime.SpecifyKind(req.StartTime, DateTimeKind.Utc);
        var endUtc = req.EndTime.HasValue ? DateTime.SpecifyKind(req.EndTime.Value, DateTimeKind.Utc) : (DateTime?)null;
        var entry = new TimeEntry
        {
            TaskId = taskId,
            UserId = userId,
            WorkspaceId = workspace.Id,
            Note = req.Note,
            StartTime = startUtc,
            EndTime = endUtc,
            DurationMinutes = req.DurationMinutes > 0 ? req.DurationMinutes : (endUtc.HasValue ? (int)(endUtc.Value - startUtc).TotalMinutes : null),
            IsRunning = false
        };
        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync();
        return Ok(new { entry.Id, entry.Note, entry.StartTime, entry.EndTime, entry.DurationMinutes, entry.IsRunning });
    }

    [HttpDelete("time-entries/{entryId}")]
    public async Task<IActionResult> DeleteEntry(string workspaceSlug, Guid entryId)
    {
        var entry = await _db.TimeEntries.FindAsync(entryId);
        if (entry == null) return NotFound();
        _db.TimeEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("my-time-entries")]
    public async Task<IActionResult> GetMyTimeEntries(string workspaceSlug, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var query = _db.TimeEntries.Where(t => t.UserId == userId && t.WorkspaceId == workspace.Id);
        if (from.HasValue) query = query.Where(t => t.StartTime >= DateTime.SpecifyKind(from.Value, DateTimeKind.Utc));
        if (to.HasValue) query = query.Where(t => t.StartTime <= DateTime.SpecifyKind(to.Value, DateTimeKind.Utc));

        var entries = await query
            .OrderByDescending(t => t.StartTime)
            .Select(t => new
            {
                t.Id, t.Note, t.StartTime, t.EndTime, t.DurationMinutes, t.IsRunning,
                Task = new { t.Task.Id, t.Task.Title }
            })
            .Take(50)
            .ToListAsync();

        var totalMinutes = await query.SumAsync(t => t.DurationMinutes ?? 0);
        return Ok(new { entries, totalMinutes });
    }
}

public class LogTimeRequest
{
    public string? Note { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int DurationMinutes { get; set; }
}
