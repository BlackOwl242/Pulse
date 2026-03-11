using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Planner;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/planner")]
[Authorize]
public class PlannerController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public PlannerController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetBlocks(string workspaceSlug, [FromQuery] DateTime date)
    {
        var userId = _currentUser.UserId!.Value;
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var blocks = await _db.PlannerBlocks
            .Where(b => b.UserId == userId && b.StartTime >= startOfDay && b.StartTime < endOfDay)
            .OrderBy(b => b.StartTime)
            .Select(b => new
            {
                b.Id, b.Title, b.StartTime, b.EndTime, b.Type, b.RecurrencePattern,
                Task = b.Task != null ? new { b.Task.Id, b.Task.Title, b.Task.Status } : null
            })
            .ToListAsync();
        return Ok(blocks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBlock(string workspaceSlug, [FromBody] CreateBlockRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var block = new PlannerBlock
        {
            UserId = userId,
            TaskId = req.TaskId,
            Title = req.Title,
            StartTime = req.StartTime,
            EndTime = req.EndTime,
            Type = req.Type,
            RecurrencePattern = req.RecurrencePattern
        };
        _db.PlannerBlocks.Add(block);
        await _db.SaveChangesAsync();
        return Ok(new { block.Id, block.Title, block.StartTime, block.EndTime, block.Type });
    }

    [HttpPut("{blockId}")]
    public async Task<IActionResult> UpdateBlock(string workspaceSlug, Guid blockId, [FromBody] UpdateBlockRequest req)
    {
        var block = await _db.PlannerBlocks.FindAsync(blockId);
        if (block == null) return NotFound();

        if (req.Title != null) block.Title = req.Title;
        if (req.StartTime.HasValue) block.StartTime = req.StartTime.Value;
        if (req.EndTime.HasValue) block.EndTime = req.EndTime.Value;
        if (req.Type.HasValue) block.Type = req.Type.Value;

        await _db.SaveChangesAsync();
        return Ok(new { block.Id, block.Title, block.StartTime, block.EndTime, block.Type });
    }

    [HttpDelete("{blockId}")]
    public async Task<IActionResult> DeleteBlock(string workspaceSlug, Guid blockId)
    {
        var block = await _db.PlannerBlocks.FindAsync(blockId);
        if (block == null) return NotFound();
        _db.PlannerBlocks.Remove(block);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateBlockRequest
{
    public Guid? TaskId { get; set; }
    public string? Title { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public PlannerBlockType Type { get; set; } = PlannerBlockType.Task;
    public string? RecurrencePattern { get; set; }
}

public class UpdateBlockRequest
{
    public string? Title { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public PlannerBlockType? Type { get; set; }
}
