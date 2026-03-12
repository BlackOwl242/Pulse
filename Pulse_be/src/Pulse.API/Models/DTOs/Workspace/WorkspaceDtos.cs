using Pulse.API.Models.Enums;

namespace Pulse.API.Models.DTOs.Workspace;

public class CreateWorkspaceRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateWorkspaceRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
}

public class WorkspaceDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }
    public WorkspacePlan Plan { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class InviteMemberRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
}

public class AddMemberByEmailRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
}
