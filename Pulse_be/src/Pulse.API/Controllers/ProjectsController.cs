using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public ProjectsController(ApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var projects = await _db.Projects
            .Where(p => p.WorkspaceId == workspace.Id)
            .Select(p => new
            {
                p.Id, p.Name, p.Description, p.Color, p.Icon, p.Status,
                p.StartDate, p.EndDate, p.CreatedAt,
                TaskCount = p.Tasks.Count,
                CompletedTaskCount = p.Tasks.Count(t => t.Status == Models.Enums.TaskItemStatus.Done)
            })
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{projectId}")]
    public async Task<IActionResult> GetById(string workspaceSlug, Guid projectId)
    {
        var project = await _db.Projects
            .Where(p => p.Id == projectId)
            .Select(p => new
            {
                p.Id, p.Name, p.Description, p.Color, p.Icon, p.Status,
                p.StartDate, p.EndDate, p.CreatedAt,
                TaskCount = p.Tasks.Count,
                CompletedTaskCount = p.Tasks.Count(t => t.Status == Models.Enums.TaskItemStatus.Done),
                Labels = p.Labels.Select(l => new { l.Id, l.Name, l.Color })
            })
            .FirstOrDefaultAsync();

        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string workspaceSlug, [FromBody] CreateProjectRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var project = new Models.Entities.TaskManagement.Project
        {
            WorkspaceId = workspace.Id,
            Name = request.Name,
            Description = request.Description,
            Color = request.Color,
            Icon = request.Icon,
            StartDate = request.StartDate.HasValue ? DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc) : null,
            EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc) : null,
            CreatedById = _currentUser.UserId!.Value,
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        // Notify all workspace members about new project
        var creator = await _db.Users.FindAsync(_currentUser.UserId!.Value);
        var memberIds = await _db.UserWorkspaceRoles
            .Where(m => m.WorkspaceId == workspace.Id && m.UserId != _currentUser.UserId!.Value)
            .Select(m => m.UserId)
            .ToListAsync();
        foreach (var mid in memberIds)
        {
            await _notifications.SendAsync(mid, workspace.Id, Models.Enums.NotificationType.Mention,
                $"{creator?.FirstName} created a new project", project.Name, "project", project.Id, _currentUser.UserId!.Value);
        }

        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId = project.Id }, new
        {
            project.Id, project.Name, project.Description, project.Color, project.Icon, project.Status,
            project.StartDate, project.EndDate, project.CreatedAt,
            TaskCount = 0, CompletedTaskCount = 0
        });
    }

    [HttpPut("{projectId}")]
    public async Task<IActionResult> Update(string workspaceSlug, Guid projectId, [FromBody] UpdateProjectRequest request)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project == null) return NotFound();

        if (request.Name != null) project.Name = request.Name;
        if (request.Description != null) project.Description = request.Description;
        if (request.Color != null) project.Color = request.Color;
        if (request.Icon != null) project.Icon = request.Icon;
        if (request.Status.HasValue) project.Status = request.Status.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{projectId}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid projectId)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project == null) return NotFound();

        project.IsDeleted = true;
        project.DeletedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class UpdateProjectRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public Models.Enums.ProjectStatus? Status { get; set; }
}
