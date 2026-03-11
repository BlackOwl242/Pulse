using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class LabelsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public LabelsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("projects/{projectId}/labels")]
    public async Task<IActionResult> GetAll(string workspaceSlug, Guid projectId)
    {
        var labels = await _db.TaskLabels
            .Where(l => l.ProjectId == projectId)
            .OrderBy(l => l.Name)
            .Select(l => new { l.Id, l.Name, l.Color })
            .ToListAsync();

        return Ok(labels);
    }

    [HttpPost("projects/{projectId}/labels")]
    public async Task<IActionResult> Create(string workspaceSlug, Guid projectId, [FromBody] CreateLabelRequest request)
    {
        var label = new TaskLabel
        {
            ProjectId = projectId,
            Name = request.Name,
            Color = request.Color ?? "#6366f1",
        };

        _db.TaskLabels.Add(label);
        await _db.SaveChangesAsync();

        return Ok(new { label.Id, label.Name, label.Color });
    }

    [HttpDelete("labels/{labelId}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid labelId)
    {
        var label = await _db.TaskLabels.FindAsync(labelId);
        if (label == null) return NotFound();

        // Remove assignments first
        var assignments = await _db.TaskLabelAssignments.Where(a => a.LabelId == labelId).ToListAsync();
        _db.TaskLabelAssignments.RemoveRange(assignments);
        _db.TaskLabels.Remove(label);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("tasks/{taskId}/labels/{labelId}")]
    public async Task<IActionResult> AssignLabel(string workspaceSlug, Guid taskId, Guid labelId)
    {
        var exists = await _db.TaskLabelAssignments
            .AnyAsync(a => a.TaskId == taskId && a.LabelId == labelId);
        if (exists) return Ok();

        _db.TaskLabelAssignments.Add(new TaskLabelAssignment { TaskId = taskId, LabelId = labelId });
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("tasks/{taskId}/labels/{labelId}")]
    public async Task<IActionResult> RemoveLabel(string workspaceSlug, Guid taskId, Guid labelId)
    {
        var assignment = await _db.TaskLabelAssignments
            .FirstOrDefaultAsync(a => a.TaskId == taskId && a.LabelId == labelId);
        if (assignment == null) return NotFound();

        _db.TaskLabelAssignments.Remove(assignment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateLabelRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
}
