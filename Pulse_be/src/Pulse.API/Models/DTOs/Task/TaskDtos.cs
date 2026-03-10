using Pulse.API.Models.Enums;

namespace Pulse.API.Models.DTOs.Task;

public class CreateTaskRequest
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.None;
    public Guid? AssigneeId { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime? StartDate { get; set; }
    public Guid? ParentTaskId { get; set; }
    public int? EstimatedMinutes { get; set; }
    public List<Guid>? LabelIds { get; set; }
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskPriority? Priority { get; set; }
    public TaskItemStatus? Status { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime? StartDate { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int? Position { get; set; }
}

public class TaskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public AssigneeDto? Assignee { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime? StartDate { get; set; }
    public int Position { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SubtaskCount { get; set; }
    public int CompletedSubtaskCount { get; set; }
    public int CommentCount { get; set; }
    public int AttachmentCount { get; set; }
    public List<LabelDto> Labels { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class AssigneeDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

public class LabelDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class BoardColumnDto
{
    public TaskItemStatus Status { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<TaskDto> Tasks { get; set; } = new();
}

public class MoveTaskRequest
{
    public TaskItemStatus Status { get; set; }
    public int Position { get; set; }
}
