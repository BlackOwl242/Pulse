using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Models.DTOs.Task;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId}/[controller]")]
[Authorize]
[RequireWorkspaceMember]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;
    private readonly IActivityLogService _activity;

    public TasksController(ApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications, IActivityLogService activity)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
        _activity = activity;
    }

    /// <summary>
    /// Get all tasks in a project (list view)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetAll(string workspaceSlug, Guid projectId,
        [FromQuery] TaskItemStatus? status = null,
        [FromQuery] TaskPriority? priority = null,
        [FromQuery] Guid? assigneeId = null,
        [FromQuery] string? search = null)
    {
        var query = _db.Tasks
            .Where(t => t.ProjectId == projectId && t.ParentTaskId == null)
            .AsQueryable();

        if (status.HasValue) query = query.Where(t => t.Status == status.Value);
        if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);
        if (assigneeId.HasValue) query = query.Where(t => t.Assignees.Any(a => a.UserId == assigneeId.Value));
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => EF.Functions.ILike(t.Title, $"%{search}%"));

        var tasks = await query
            .OrderBy(t => t.Position)
            .Select(t => MapToDto(t))
            .ToListAsync();

        return Ok(tasks);
    }

    /// <summary>
    /// Get board view (Kanban) — tasks grouped by status
    /// </summary>
    [HttpGet("board")]
    public async Task<ActionResult<List<BoardColumnDto>>> GetBoardView(string workspaceSlug, Guid projectId)
    {
        var statuses = Enum.GetValues<TaskItemStatus>();
        var board = new List<BoardColumnDto>();

        foreach (var status in statuses)
        {
            var tasks = await _db.Tasks
                .Include(t => t.Assignees).ThenInclude(a => a.User)
                .Where(t => t.ProjectId == projectId && t.ParentTaskId == null && t.Status == status)
                .OrderBy(t => t.Position)
                .Select(t => MapToDto(t))
                .ToListAsync();

            board.Add(new BoardColumnDto
            {
                Status = status,
                Name = status.ToString(),
                Tasks = tasks
            });
        }

        return Ok(board);
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("/api/workspaces/{workspaceSlug}/tasks/{taskId}")]
    public async Task<ActionResult<TaskDto>> GetById(string workspaceSlug, Guid taskId)
    {
        var task = await _db.Tasks
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.LabelAssignments).ThenInclude(la => la.Label)
            .Include(t => t.Subtasks)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return NotFound();
        return Ok(MapToDto(task));
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(string workspaceSlug, Guid projectId, [FromBody] CreateTaskRequest request)
    {
        var userId = _currentUser.UserId!.Value;

        var maxPosition = await _db.Tasks
            .Where(t => t.ProjectId == projectId && t.Status == TaskItemStatus.Todo && t.ParentTaskId == null)
            .MaxAsync(t => (int?)t.Position) ?? -1;

        var task = new TaskItem
        {
            ProjectId = projectId,
            ParentTaskId = request.ParentTaskId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Deadline = request.Deadline.HasValue ? DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc) : null,
            StartDate = request.StartDate.HasValue ? DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc) : null,
            EstimatedMinutes = request.EstimatedMinutes,
            Position = maxPosition + 1,
            CreatedById = userId,
        };

        if (request.AssigneeIds != null && request.AssigneeIds.Any())
        {
            foreach (var aId in request.AssigneeIds)
            {
                task.Assignees.Add(new TaskAssignee { TaskId = task.Id, UserId = aId });
            }
        }

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // Notify assigned users and log activity
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace != null)
        {
            await _activity.LogActivityAsync(workspace.Id, userId, "Task", task.Id, "Created", $"Created task '{task.Title}'");

            if (request.AssigneeIds != null)
            {
                foreach (var aId in request.AssigneeIds.Where(a => a != userId))
                {
                    await _notifications.SendAsync(aId, workspace.Id, NotificationType.TaskAssigned,
                        $"You have been assigned to task: {task.Title}",
                        entityType: "task", entityId: task.Id, actorId: userId);
                }
            }
        }

        return CreatedAtAction(nameof(GetById),
            new { workspaceSlug, taskId = task.Id },
            MapToDto(task));
    }

    /// <summary>
    /// Update an existing task
    /// </summary>
    [HttpPut("/api/workspaces/{workspaceSlug}/tasks/{taskId}")]
    public async Task<IActionResult> Update(string workspaceSlug, Guid taskId, [FromBody] UpdateTaskRequest request)
    {
        var userId = _currentUser.UserId!.Value;
        var task = await _db.Tasks.Include(t => t.Assignees).FirstOrDefaultAsync(t => t.Id == taskId);
        if (task == null) return NotFound();

        if (request.Title != null) task.Title = request.Title;
        if (request.Description != null) task.Description = request.Description;
        if (request.Priority.HasValue) task.Priority = request.Priority.Value;
        
        // Update assignees if provided in the payload (non-null array)
        if (request.AssigneeIds != null)
        {
            task.Assignees.Clear();
            foreach (var aId in request.AssigneeIds)
            {
                task.Assignees.Add(new TaskAssignee { TaskId = task.Id, UserId = aId });
            }
        }

        task.Deadline = request.Deadline.HasValue ? DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc) : null;
        task.StartDate = request.StartDate.HasValue ? DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc) : null;
        
        if (request.EstimatedMinutes.HasValue) task.EstimatedMinutes = request.EstimatedMinutes;
        if (request.Position.HasValue) task.Position = request.Position.Value;

        if (request.Status.HasValue)
        {
            task.Status = request.Status.Value;
            task.CompletedAt = request.Status.Value == TaskItemStatus.Done ? DateTime.UtcNow : null;
        }

        await _db.SaveChangesAsync();

        // Send notifications and log activity
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace != null)
        {
            await _activity.LogActivityAsync(workspace.Id, userId, "Task", task.Id, "Updated", $"Updated task '{task.Title}'");

            // Notify new assignees
            if (request.AssigneeIds != null)
            {
                foreach (var aId in request.AssigneeIds.Where(a => a != userId))
                {
                    await _notifications.SendAsync(aId, workspace.Id, NotificationType.TaskAssigned,
                        $"You have been assigned to task: {task.Title}",
                        entityType: "task", entityId: task.Id, actorId: userId);
                }
            }

            // Notify task creator when status changes
            if (request.Status.HasValue && task.CreatedById.HasValue && task.CreatedById.Value != userId)
            {
                await _notifications.SendAsync(task.CreatedById.Value, workspace.Id, NotificationType.StatusChanged,
                    $"Task '{task.Title}' status changed to {request.Status.Value}",
                    entityType: "task", entityId: task.Id, actorId: userId);
            }
        }

        return NoContent();
    }

    /// <summary>
    /// Move task (change status and position — for drag & drop)
    /// </summary>
    [HttpPatch("/api/workspaces/{workspaceSlug}/tasks/{taskId}/move")]
    public async Task<IActionResult> MoveTask(string workspaceSlug, Guid taskId, [FromBody] MoveTaskRequest request)
    {
        var userId = _currentUser.UserId!.Value;
        var task = await _db.Tasks.FindAsync(taskId);
        if (task == null) return NotFound();

        var oldStatus = task.Status;
        task.Status = request.Status;
        task.Position = request.Position;
        task.CompletedAt = request.Status == TaskItemStatus.Done ? DateTime.UtcNow : null;

        await _db.SaveChangesAsync();

        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace != null)
        {
            await _activity.LogActivityAsync(workspace.Id, userId, "Task", task.Id, "Moved", $"Moved task '{task.Title}' from {oldStatus} to {request.Status}");
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a task (soft delete)
    /// </summary>
    [HttpDelete("/api/workspaces/{workspaceSlug}/tasks/{taskId}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid taskId)
    {
        var userId = _currentUser.UserId!.Value;
        var task = await _db.Tasks.FindAsync(taskId);
        if (task == null) return NotFound();

        task.IsDeleted = true;
        task.DeletedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace != null)
        {
            await _activity.LogActivityAsync(workspace.Id, userId, "Task", task.Id, "Deleted", $"Deleted task '{task.Title}'");
        }

        return NoContent();
    }

    private static TaskDto MapToDto(TaskItem t) => new()
    {
        Id = t.Id,
        ProjectId = t.ProjectId,
        Title = t.Title,
        Description = t.Description,
        Status = t.Status,
        Priority = t.Priority,
        Assignees = t.Assignees?.Select(a => new AssigneeDto
        {
            Id = a.User.Id,
            FirstName = a.User.FirstName,
            LastName = a.User.LastName,
            AvatarUrl = a.User.AvatarUrl
        }).ToList() ?? new(),
        Deadline = t.Deadline,
        StartDate = t.StartDate,
        Position = t.Position,
        EstimatedMinutes = t.EstimatedMinutes,
        SubtaskCount = t.Subtasks?.Count ?? 0,
        CompletedSubtaskCount = t.Subtasks?.Count(s => s.Status == TaskItemStatus.Done) ?? 0,
        CommentCount = t.Comments?.Count ?? 0,
        AttachmentCount = t.Attachments?.Count ?? 0,
        Labels = t.LabelAssignments?.Select(la => new LabelDto
        {
            Id = la.Label.Id,
            Name = la.Label.Name,
            Color = la.Label.Color
        }).ToList() ?? new(),
        CreatedAt = t.CreatedAt,
        CompletedAt = t.CompletedAt
    };
}
