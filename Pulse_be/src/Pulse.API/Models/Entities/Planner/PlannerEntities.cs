using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.TaskManagement;

namespace Pulse.API.Models.Entities.Planner;

public class PlannerBlock : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid? TaskId { get; set; }
    public TaskItem? Task { get; set; }
    public string? Title { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public PlannerBlockType Type { get; set; } = PlannerBlockType.Task;
    public string? RecurrencePattern { get; set; }
}

public class CalendarEvent : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public string? GoogleEventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string? Location { get; set; }
    public CalendarEventStatus Status { get; set; } = CalendarEventStatus.Confirmed;
    public List<string> Attendees { get; set; } = new();
}

public class Meeting : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public Guid OrganizerId { get; set; }
    public User Organizer { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Agenda { get; set; }
    public DateTime ProposedStartTime { get; set; }
    public DateTime ProposedEndTime { get; set; }
    public MeetingStatus Status { get; set; } = MeetingStatus.Proposed;
    public Guid? CalendarEventId { get; set; }
    public CalendarEvent? CalendarEvent { get; set; }

    public ICollection<MeetingParticipant> Participants { get; set; } = new List<MeetingParticipant>();
}

public class MeetingParticipant : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Meeting Meeting { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public ResponseStatus ResponseStatus { get; set; } = ResponseStatus.Pending;
    public DateTime? RespondedAt { get; set; }
}
