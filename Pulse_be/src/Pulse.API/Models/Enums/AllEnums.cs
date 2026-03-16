namespace Pulse.API.Models.Enums;

public enum AuthProvider { Local, Google, Keycloak }
public enum InvitationStatus { Pending, Accepted, Expired, Revoked }
public enum WorkspacePlan { Free, Pro, Enterprise }

public enum TaskItemStatus { Todo, InProgress, InReview, Done, Cancelled }
public enum TaskPriority { None, Low, Medium, High, Urgent }
public enum ProjectStatus { Active, Archived, Completed }

public enum ChannelType { Direct, Group, Task }
public enum MessageType { Text, File, System }
public enum NotificationType { Mention, TaskAssigned, Deadline, Comment, Invitation, StatusChanged, Message }
public enum NotificationChannel { InApp, Email, Push }
public enum ChannelMemberRole { Member, Admin, Creator }

public enum PlannerBlockType { Task, Meeting, Personal, Break }
public enum CalendarEventStatus { Tentative, Confirmed, Cancelled }
public enum MeetingStatus { Proposed, Confirmed, Cancelled }
public enum ResponseStatus { Pending, Accepted, Declined, Tentative }

public enum OKRStatus { Draft, Active, Completed, Cancelled }
public enum OKRMetricType { Percentage, Number, Currency, Boolean }
public enum OKRConfidence { OnTrack, AtRisk, OffTrack }

public enum AIRole { User, Assistant, System }
public enum AIActionStatus { Pending, Approved, Executed, Failed }

public enum DashboardWidgetType { TaskSummary, Workload, Burndown, Velocity, OkrProgress }
public enum AnalyticsPeriod { Daily, Weekly, Monthly }
public enum DependencyType { Blocks, BlockedBy, RelatesTo }
