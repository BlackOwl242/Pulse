using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Models.Entities.Planner;
using Pulse.API.Models.Entities.Strategy;
using Pulse.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Pulse.API.Services;

public interface IAIActionExecutor
{
    Task<List<ActionResult>> ExecuteActionsAsync(List<AIAction> actions, Guid workspaceId, Guid userId);
}

public class AIAction
{
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, JsonElement> Data { get; set; } = new();

    public string GetString(string key, string defaultValue = "")
        => Data.TryGetValue(key, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() ?? defaultValue : defaultValue;
    
    public DateTime? GetDateTime(string key)
        => Data.TryGetValue(key, out var v) && v.ValueKind == JsonValueKind.String && DateTime.TryParse(v.GetString(), out var dt) ? dt : null;
}

public class ActionResult
{
    public string Type { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
}

public class AIActionExecutor : IAIActionExecutor
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AIActionExecutor> _logger;

    public AIActionExecutor(ApplicationDbContext db, ILogger<AIActionExecutor> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<ActionResult>> ExecuteActionsAsync(List<AIAction> actions, Guid workspaceId, Guid userId)
    {
        var results = new List<ActionResult>();
        foreach (var action in actions)
        {
            try
            {
                var result = action.Type switch
                {
                    "create_task" => await CreateTaskAsync(action, workspaceId, userId),
                    "create_project" => await CreateProjectAsync(action, workspaceId, userId),
                    "create_meeting" => await CreateMeetingAsync(action, workspaceId, userId),
                    "create_objective" => await CreateObjectiveAsync(action, workspaceId, userId),
                    "create_planner_block" => await CreatePlannerBlockAsync(action, userId),
                    "update_task" => await UpdateTaskAsync(action, workspaceId),
                    _ => new ActionResult { Type = action.Type, Success = false, Message = $"Unknown action: {action.Type}" }
                };
                results.Add(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute AI action: {Type}", action.Type);
                results.Add(new ActionResult { Type = action.Type, Success = false, Message = ex.Message });
            }
        }
        return results;
    }

    private async Task<ActionResult> CreateTaskAsync(AIAction action, Guid workspaceId, Guid userId)
    {
        var title = action.GetString("title");
        var projectName = action.GetString("projectName");
        var priorityStr = action.GetString("priority", "None");
        var statusStr = action.GetString("status", "Todo");
        var description = action.GetString("description");

        if (string.IsNullOrWhiteSpace(title))
            return new ActionResult { Type = "create_task", Success = false, Message = "Missing task title" };

        // Find project by name
        var project = await _db.Projects
            .Where(p => p.WorkspaceId == workspaceId)
            .FirstOrDefaultAsync(p => EF.Functions.ILike(p.Name, projectName));

        if (project == null)
        {
            // Try partial match
            project = await _db.Projects
                .Where(p => p.WorkspaceId == workspaceId)
                .FirstOrDefaultAsync(p => EF.Functions.ILike(p.Name, $"%{projectName}%"));
        }

        if (project == null)
            return new ActionResult { Type = "create_task", Success = false, Message = $"Project '{projectName}' not found" };

        Enum.TryParse<TaskPriority>(priorityStr, true, out var priority);
        Enum.TryParse<TaskItemStatus>(statusStr, true, out var status);

        var maxPos = await _db.Tasks.Where(t => t.ProjectId == project.Id).CountAsync();
        var task = new TaskItem
        {
            ProjectId = project.Id,
            Title = title,
            Description = string.IsNullOrWhiteSpace(description) ? null : description,
            Priority = priority,
            Status = status,
            CreatedById = userId,
            Position = maxPos,
            Assignees = new List<TaskAssignee> { new TaskAssignee { UserId = userId } }
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        _logger.LogInformation("AI created task '{Title}' in project '{Project}'", title, project.Name);
        return new ActionResult { Type = "create_task", Success = true, Message = $"Task '{title}' created in {project.Name}", EntityId = task.Id };
    }

    private async Task<ActionResult> CreateProjectAsync(AIAction action, Guid workspaceId, Guid userId)
    {
        var name = action.GetString("name");
        var description = action.GetString("description");
        var color = action.GetString("color", "#6366f1");

        if (string.IsNullOrWhiteSpace(name))
            return new ActionResult { Type = "create_project", Success = false, Message = "Missing project name" };

        var project = new Project
        {
            WorkspaceId = workspaceId,
            Name = name,
            Description = string.IsNullOrWhiteSpace(description) ? null : description,
            Color = color,
            CreatedById = userId,
            Status = ProjectStatus.Active
        };
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        _logger.LogInformation("AI created project '{Name}'", name);
        return new ActionResult { Type = "create_project", Success = true, Message = $"Project '{name}' created", EntityId = project.Id };
    }

    private async Task<ActionResult> CreateMeetingAsync(AIAction action, Guid workspaceId, Guid userId)
    {
        var title = action.GetString("title");
        var description = action.GetString("description");
        var startTime = action.GetDateTime("startTime");
        var endTime = action.GetDateTime("endTime");

        if (string.IsNullOrWhiteSpace(title))
            return new ActionResult { Type = "create_meeting", Success = false, Message = "Missing meeting title" };

        var meeting = new Meeting
        {
            WorkspaceId = workspaceId,
            OrganizerId = userId,
            Title = title,
            Description = string.IsNullOrWhiteSpace(description) ? null : description,
            ProposedStartTime = startTime ?? DateTime.UtcNow.AddDays(1).Date.AddHours(10),
            ProposedEndTime = endTime ?? DateTime.UtcNow.AddDays(1).Date.AddHours(11),
            Status = MeetingStatus.Proposed,
            Participants = new List<MeetingParticipant> { new MeetingParticipant { UserId = userId } }
        };
        _db.Meetings.Add(meeting);
        await _db.SaveChangesAsync();

        _logger.LogInformation("AI created meeting '{Title}'", title);
        return new ActionResult { Type = "create_meeting", Success = true, Message = $"Meeting '{title}' scheduled", EntityId = meeting.Id };
    }

    private async Task<ActionResult> CreateObjectiveAsync(AIAction action, Guid workspaceId, Guid userId)
    {
        var title = action.GetString("title");
        var description = action.GetString("description");
        var period = action.GetString("period");

        if (string.IsNullOrWhiteSpace(title))
            return new ActionResult { Type = "create_objective", Success = false, Message = "Missing objective title" };

        var objective = new Objective
        {
            WorkspaceId = workspaceId,
            OwnerId = userId,
            Title = title,
            Description = string.IsNullOrWhiteSpace(description) ? null : description,
            Period = string.IsNullOrWhiteSpace(period) ? $"Q{(DateTime.UtcNow.Month - 1) / 3 + 1}-{DateTime.UtcNow.Year}" : period,
            Status = OKRStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3)
        };
        _db.Objectives.Add(objective);
        await _db.SaveChangesAsync();

        _logger.LogInformation("AI created objective '{Title}'", title);
        return new ActionResult { Type = "create_objective", Success = true, Message = $"Objective '{title}' created", EntityId = objective.Id };
    }

    private async Task<ActionResult> CreatePlannerBlockAsync(AIAction action, Guid userId)
    {
        var title = action.GetString("title");
        var startTime = action.GetDateTime("startTime");
        var endTime = action.GetDateTime("endTime");

        if (string.IsNullOrWhiteSpace(title))
            return new ActionResult { Type = "create_planner_block", Success = false, Message = "Missing block title" };

        var block = new PlannerBlock
        {
            UserId = userId,
            Title = title,
            StartTime = startTime ?? DateTime.UtcNow.AddDays(1).Date.AddHours(9),
            EndTime = endTime ?? DateTime.UtcNow.AddDays(1).Date.AddHours(10),
            Type = PlannerBlockType.Personal
        };
        _db.PlannerBlocks.Add(block);
        await _db.SaveChangesAsync();

        _logger.LogInformation("AI created planner block '{Title}'", title);
        return new ActionResult { Type = "create_planner_block", Success = true, Message = $"Planner block '{title}' created", EntityId = block.Id };
    }

    private async Task<ActionResult> UpdateTaskAsync(AIAction action, Guid workspaceId)
    {
        var taskTitle = action.GetString("taskTitle");
        var statusStr = action.GetString("status");
        var priorityStr = action.GetString("priority");

        if (string.IsNullOrWhiteSpace(taskTitle))
            return new ActionResult { Type = "update_task", Success = false, Message = "Missing task title" };

        var task = await _db.Tasks
            .Where(t => t.Project.WorkspaceId == workspaceId)
            .FirstOrDefaultAsync(t => EF.Functions.ILike(t.Title, $"%{taskTitle}%"));

        if (task == null)
            return new ActionResult { Type = "update_task", Success = false, Message = $"Task '{taskTitle}' not found" };

        if (!string.IsNullOrWhiteSpace(statusStr) && Enum.TryParse<TaskItemStatus>(statusStr, true, out var status))
        {
            task.Status = status;
            if (status == TaskItemStatus.Done) task.CompletedAt = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(priorityStr) && Enum.TryParse<TaskPriority>(priorityStr, true, out var priority))
            task.Priority = priority;

        await _db.SaveChangesAsync();

        _logger.LogInformation("AI updated task '{Title}'", task.Title);
        return new ActionResult { Type = "update_task", Success = true, Message = $"Task '{task.Title}' updated", EntityId = task.Id };
    }
}
