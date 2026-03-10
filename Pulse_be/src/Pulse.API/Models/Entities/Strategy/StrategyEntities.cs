using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.TaskManagement;

namespace Pulse.API.Models.Entities.Strategy;

public class Objective : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Guid? ParentObjectiveId { get; set; }
    public Objective? ParentObjective { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Period { get; set; } // "Q1-2026", "H1-2026", "2026"
    public OKRStatus Status { get; set; } = OKRStatus.Draft;
    public decimal Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public ICollection<Objective> ChildObjectives { get; set; } = new List<Objective>();
    public ICollection<KeyResult> KeyResults { get; set; } = new List<KeyResult>();
}

public class KeyResult : BaseEntity
{
    public Guid ObjectiveId { get; set; }
    public Objective Objective { get; set; } = null!;
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public OKRMetricType MetricType { get; set; } = OKRMetricType.Percentage;
    public decimal StartValue { get; set; }
    public decimal TargetValue { get; set; }
    public decimal CurrentValue { get; set; }
    public string? Unit { get; set; }
    public decimal Progress { get; set; }

    public ICollection<KeyResultTaskLink> TaskLinks { get; set; } = new List<KeyResultTaskLink>();
    public ICollection<OKRCheckIn> CheckIns { get; set; } = new List<OKRCheckIn>();
}

public class KeyResultTaskLink : BaseEntity
{
    public Guid KeyResultId { get; set; }
    public KeyResult KeyResult { get; set; } = null!;
    public Guid TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;
    public decimal WeightPercent { get; set; }
}

public class OKRCheckIn : BaseEntity
{
    public Guid KeyResultId { get; set; }
    public KeyResult KeyResult { get; set; } = null!;
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public decimal PreviousValue { get; set; }
    public decimal NewValue { get; set; }
    public string? Note { get; set; }
    public OKRConfidence Confidence { get; set; } = OKRConfidence.OnTrack;
}
