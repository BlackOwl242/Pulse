using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.TaskManagement;

namespace Pulse.API.Models.Entities.Analytics;

public class TimeEntry : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Note { get; set; }
    public bool IsRunning { get; set; }
}

public class DashboardWidget : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public DashboardWidgetType WidgetType { get; set; }
    public string? Config { get; set; } // JSON
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public int Width { get; set; } = 4;
    public int Height { get; set; } = 3;
}

public class AnalyticsSnapshot : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public string MetricType { get; set; } = string.Empty;
    public string Data { get; set; } = "{}"; // JSON
    public DateOnly SnapshotDate { get; set; }
    public AnalyticsPeriod Period { get; set; }
}

public class WorkloadSummary : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public DateOnly PeriodDate { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int TotalMinutesTracked { get; set; }
    public int EstimatedMinutesRemaining { get; set; }
    public decimal CompletionRate { get; set; }
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}
