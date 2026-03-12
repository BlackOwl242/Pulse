using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;

namespace Pulse.API.Models.Entities.TaskManagement;

public class Project : AuditableEntity, ISoftDeletable
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Soft delete
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<TaskLabel> Labels { get; set; } = new List<TaskLabel>();
}

public class TaskItem : AuditableEntity, ISoftDeletable
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? ParentTaskId { get; set; }
    public TaskItem? ParentTask { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;
    public TaskPriority Priority { get; set; } = TaskPriority.None;
    public ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
    public DateTime? Deadline { get; set; }
    public DateTime? StartDate { get; set; }
    public int Position { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int? ActualMinutes { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Soft delete
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation
    public ICollection<TaskItem> Subtasks { get; set; } = new List<TaskItem>();
    public ICollection<TaskFollower> Followers { get; set; } = new List<TaskFollower>();
    public ICollection<TaskLabelAssignment> LabelAssignments { get; set; } = new List<TaskLabelAssignment>();
    public ICollection<TaskChecklist> Checklists { get; set; } = new List<TaskChecklist>();
    public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public ICollection<TaskDependency> Dependencies { get; set; } = new List<TaskDependency>();
    public ICollection<TaskDependency> Dependents { get; set; } = new List<TaskDependency>();
}

public class TaskAssignee
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}

public class TaskFollower
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}

public class TaskLabel : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6366f1";

    public ICollection<TaskLabelAssignment> Assignments { get; set; } = new List<TaskLabelAssignment>();
}

public class TaskLabelAssignment
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid LabelId { get; set; }
    public TaskLabel Label { get; set; } = null!;
}

public class TaskChecklist : BaseEntity
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }

    public ICollection<ChecklistItem> Items { get; set; } = new List<ChecklistItem>();
}

public class ChecklistItem : BaseEntity
{
    public Guid ChecklistId { get; set; }
    public TaskChecklist Checklist { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public int Position { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class TaskAttachment : BaseEntity
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
}

public class TaskComment : BaseEntity
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public TaskComment? ParentComment { get; set; }

    public ICollection<TaskComment> Replies { get; set; } = new List<TaskComment>();
}

public class TaskDependency : BaseEntity
{
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid DependsOnTaskId { get; set; }
    public TaskItem DependsOnTask { get; set; } = null!;
    public DependencyType Type { get; set; } = DependencyType.Blocks;
}
