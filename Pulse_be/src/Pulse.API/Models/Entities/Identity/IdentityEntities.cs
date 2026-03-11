using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Organization;

namespace Pulse.API.Models.Entities.Identity;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public AuthProvider Provider { get; set; } = AuthProvider.Local;
    public string? ProviderId { get; set; }
    public bool EmailConfirmed { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public UserProfile? Profile { get; set; }
    public ICollection<UserWorkspaceRole> WorkspaceRoles { get; set; } = new List<UserWorkspaceRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
}

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystem { get; set; } = false; // true = built-in role, can't be deleted
    public Guid? WorkspaceId { get; set; } // null = system role, non-null = custom workspace role
    public Organization.Workspace? Workspace { get; set; }

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<UserWorkspaceRole> UserWorkspaceRoles { get; set; } = new List<UserWorkspaceRole>();
}

public class Permission : BaseEntity
{
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}

public class UserWorkspaceRole : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public Organization.Workspace Workspace { get; set; } = null!;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string? CreatedByIp { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public string? ReplacedByToken { get; set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsRevoked && !IsExpired;
}

public class PasswordResetToken : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}
