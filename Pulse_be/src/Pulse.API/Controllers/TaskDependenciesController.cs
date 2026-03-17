using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Models.Enums;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
[RequireWorkspaceMember]
public class TaskDependenciesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TaskDependenciesController(ApplicationDbContext db) => _db = db;

    [HttpGet("tasks/{taskId}/dependencies")]
    public async Task<IActionResult> GetDependencies(string workspaceSlug, Guid taskId)
    {
        var deps = await _db.TaskDependencies
            .Where(d => d.TaskId == taskId || d.DependsOnTaskId == taskId)
            .Select(d => new
            {
                d.Id, d.TaskId, d.DependsOnTaskId, d.Type,
                Task = new { d.Task.Id, d.Task.Title, d.Task.Status },
                DependsOnTask = new { d.DependsOnTask.Id, d.DependsOnTask.Title, d.DependsOnTask.Status }
            })
            .ToListAsync();
        return Ok(deps);
    }

    [HttpPost("tasks/{taskId}/dependencies")]
    public async Task<IActionResult> AddDependency(string workspaceSlug, Guid taskId, [FromBody] AddDependencyRequest req)
    {
        // Prevent self-dependency
        if (taskId == req.DependsOnTaskId) return BadRequest("Cannot depend on self");

        // Prevent duplicates
        var exists = await _db.TaskDependencies.AnyAsync(d => d.TaskId == taskId && d.DependsOnTaskId == req.DependsOnTaskId);
        if (exists) return Conflict("Dependency already exists");

        var dep = new TaskDependency
        {
            TaskId = taskId,
            DependsOnTaskId = req.DependsOnTaskId,
            Type = req.Type
        };
        _db.TaskDependencies.Add(dep);
        await _db.SaveChangesAsync();
        return Ok(new { dep.Id, dep.TaskId, dep.DependsOnTaskId, dep.Type });
    }

    [HttpDelete("dependencies/{dependencyId}")]
    public async Task<IActionResult> RemoveDependency(string workspaceSlug, Guid dependencyId)
    {
        var dep = await _db.TaskDependencies.FindAsync(dependencyId);
        if (dep == null) return NotFound();
        _db.TaskDependencies.Remove(dep);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class AddDependencyRequest
{
    public Guid DependsOnTaskId { get; set; }
    public DependencyType Type { get; set; } = DependencyType.Blocks;
}
