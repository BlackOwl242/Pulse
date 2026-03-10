using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;

namespace Pulse.API.Models.Entities.Organization;

public class Workspace : AuditableEntity, ISoftDeletable
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public WorkspacePlan Plan { get; set; } = WorkspacePlan.Free;

    // Soft delete
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation
    public ICollection<Team> Teams { get; set; } = new List<Team>();
    public ICollection<UserWorkspaceRole> Members { get; set; } = new List<UserWorkspaceRole>();
    public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
    public ICollection<TaskManagement.Project> Projects { get; set; } = new List<TaskManagement.Project>();
}

public class Team : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }

    // Navigation
    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
}

public class TeamMember : BaseEntity
{
    public Guid TeamId { get; set; }
    public Team Team { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Role { get; set; } = "member"; // "lead" | "member"
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

public class UserProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Phone { get; set; }
    public string? Timezone { get; set; }
    public string? Bio { get; set; }
    public List<string> Skills { get; set; } = new();
    public Dictionary<string, string> SocialLinks { get; set; } = new();
}

public class Invitation : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public string Email { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public Guid InvitedById { get; set; }
    public User InvitedBy { get; set; } = null!;
    public string Token { get; set; } = Guid.NewGuid().ToString("N");
    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
