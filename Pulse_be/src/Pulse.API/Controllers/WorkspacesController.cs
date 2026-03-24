using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Models.DTOs.Workspace;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;
using System.Text.RegularExpressions;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkspacesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;
    private readonly IActivityLogService _activity;

    public WorkspacesController(ApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications, IActivityLogService activity)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
        _activity = activity;
    }

    /// <summary>
    /// Get all workspaces for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<WorkspaceDto>>> GetAll()
    {
        var userId = _currentUser.UserId!.Value;
        var workspaces = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.UserId == userId)
            .Include(uwr => uwr.Role)
            .Select(uwr => new WorkspaceDto
            {
                Id = uwr.Workspace.Id,
                Name = uwr.Workspace.Name,
                Slug = uwr.Workspace.Slug,
                LogoUrl = uwr.Workspace.LogoUrl,
                Description = uwr.Workspace.Description,
                Plan = uwr.Workspace.Plan,
                MemberCount = uwr.Workspace.Members.Count,
                CreatedAt = uwr.Workspace.CreatedAt,
                RoleName = uwr.Role.Name,
                IsOwner = uwr.Workspace.OwnerId == userId
            })
            .ToListAsync();

        return Ok(workspaces);
    }

    /// <summary>
    /// Get workspace by slug
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<WorkspaceDto>> GetBySlug(string slug)
    {
        var workspace = await _db.Workspaces
            .Where(w => w.Slug == slug)
            .Select(w => new WorkspaceDto
            {
                Id = w.Id,
                Name = w.Name,
                Slug = w.Slug,
                LogoUrl = w.LogoUrl,
                Description = w.Description,
                Plan = w.Plan,
                MemberCount = w.Members.Count,
                CreatedAt = w.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (workspace == null) return NotFound();
        return Ok(workspace);
    }

    /// <summary>
    /// Create a new workspace
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WorkspaceDto>> Create([FromBody] CreateWorkspaceRequest request)
    {
        var userId = _currentUser.UserId!.Value;
        var slug = GenerateSlug(request.Name);

        var workspace = new Workspace
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            OwnerId = userId,
            CreatedById = userId,
        };

        _db.Workspaces.Add(workspace);

        // Assign Admin role to creator
        var adminRole = await _db.Roles.FirstAsync(r => r.Name == "Admin" && r.IsSystem);
        _db.UserWorkspaceRoles.Add(new UserWorkspaceRole
        {
            UserId = userId,
            WorkspaceId = workspace.Id,
            RoleId = adminRole.Id
        });

        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBySlug), new { slug = workspace.Slug }, new WorkspaceDto
        {
            Id = workspace.Id,
            Name = workspace.Name,
            Slug = workspace.Slug,
            Description = workspace.Description,
            Plan = workspace.Plan,
            MemberCount = 1,
            CreatedAt = workspace.CreatedAt
        });
    }

    /// <summary>
    /// Update workspace
    /// </summary>
    [HttpPut("{slug}")]
    [RequireWorkspaceMember]
    [RequirePermission("workspace.manage")]
    public async Task<IActionResult> Update(string slug, [FromBody] UpdateWorkspaceRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        if (request.Name != null) workspace.Name = request.Name;
        if (request.Description != null) workspace.Description = request.Description;
        if (request.LogoUrl != null) workspace.LogoUrl = request.LogoUrl;

        await _db.SaveChangesAsync();

        await _activity.LogActivityAsync(workspace.Id, _currentUser.UserId!.Value, "Workspace", workspace.Id, "Updated", "Updated workspace settings");

        return NoContent();
    }

    /// <summary>
    /// List workspace members with their roles
    /// </summary>
    [HttpGet("{slug}/members")]
    public async Task<IActionResult> GetMembers(string slug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        var members = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == workspace.Id)
            .Select(uwr => new
            {
                UserId = uwr.UserId,
                Email = uwr.User.Email,
                FirstName = uwr.User.FirstName,
                LastName = uwr.User.LastName,
                AvatarUrl = uwr.User.AvatarUrl,
                RoleId = uwr.RoleId,
                RoleName = uwr.Role.Name,
                AssignedAt = uwr.AssignedAt,
            })
            .ToListAsync();

        return Ok(members);
    }

    /// <summary>
    /// Remove a member from the workspace (owner/admin only, cannot remove owner)
    /// </summary>
    [HttpDelete("{slug}/members/{userId:guid}")]
    [RequirePermission("workspace.manage")]
    public async Task<IActionResult> RemoveMember(string slug, Guid userId)
    {
        var currentUserId = _currentUser.UserId!.Value;
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        if (workspace.OwnerId == userId)
            return BadRequest(new { message = "Cannot remove the workspace owner" });

        var membership = await _db.UserWorkspaceRoles
            .FirstOrDefaultAsync(uwr => uwr.UserId == userId && uwr.WorkspaceId == workspace.Id);
        if (membership == null) return NotFound(new { message = "Member not found" });

        _db.UserWorkspaceRoles.Remove(membership);
        await _db.SaveChangesAsync();

        var removedUser = await _db.Users.FindAsync(userId);
        if (removedUser != null)
        {
            await _activity.LogActivityAsync(workspace.Id, currentUserId, "Workspace", workspace.Id, "MemberRemoved", $"Removed user {removedUser.Email} from workspace");
        }

        // Notify the removed user
        var actor = await _db.Users.FindAsync(currentUserId);
        await _notifications.SendAsync(userId, workspace.Id, NotificationType.StatusChanged,
            $"You were removed from {workspace.Name}",
            $"Removed by {actor?.FirstName}",
            "workspace", workspace.Id, currentUserId);

        return Ok(new { message = "Member removed" });
    }
    /// Change a member's role in the workspace
    /// </summary>
    [HttpPut("{slug}/members/{userId:guid}/role")]
    [RequirePermission("workspace.manage")]
    public async Task<IActionResult> ChangeMemberRole(string slug, Guid userId, [FromBody] ChangeMemberRoleRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound(new { message = "Workspace not found" });

        var membership = await _db.UserWorkspaceRoles
            .FirstOrDefaultAsync(uwr => uwr.UserId == userId && uwr.WorkspaceId == workspace.Id);
        if (membership == null) return NotFound(new { message = "Member not found in workspace" });

        // Verify the role exists and is accessible to this workspace
        var role = await _db.Roles.FirstOrDefaultAsync(r =>
            r.Id == request.RoleId && (r.WorkspaceId == null || r.WorkspaceId == workspace.Id));
        if (role == null) return BadRequest(new { message = "Invalid role" });

        // Prevent removing the last admin
        if (membership.Role?.Name == "Admin" || (await _db.UserWorkspaceRoles
            .CountAsync(uwr => uwr.WorkspaceId == workspace.Id &&
                               uwr.Role.Name == "Admin") <= 1))
        {
            var currentRole = await _db.Roles.FindAsync(membership.RoleId);
            if (currentRole?.Name == "Admin" && role.Name != "Admin")
            {
                var adminCount = await _db.UserWorkspaceRoles
                    .CountAsync(uwr => uwr.WorkspaceId == workspace.Id && uwr.Role.Name == "Admin");
                if (adminCount <= 1)
                    return BadRequest(new { message = "Cannot remove the last admin" });
            }
        }

        membership.RoleId = request.RoleId;
        membership.AssignedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var targetUser = await _db.Users.FindAsync(userId);
        if (targetUser != null)
        {
            await _activity.LogActivityAsync(workspace.Id, _currentUser.UserId!.Value, "Workspace", workspace.Id, "RoleChanged", $"Changed role for {targetUser.Email} to {role.Name}");
        }

        // Notify the user about role change
        var changer = await _db.Users.FindAsync(_currentUser.UserId!.Value);
        await _notifications.SendAsync(userId, workspace.Id, NotificationType.StatusChanged,
            $"{changer?.FirstName} changed your role", $"Your role is now {role.Name}", "workspace", workspace.Id, _currentUser.UserId!.Value);

        return Ok(new { message = "Role updated", roleId = request.RoleId, roleName = role.Name });
    }

    /// <summary>
    /// Invite a member to workspace
    /// </summary>
    [HttpPost("{slug}/invitations")]
    [RequirePermission("workspace.invite_member")]
    public async Task<IActionResult> InviteMember(string slug, [FromBody] InviteMemberRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        var invitation = new Invitation
        {
            WorkspaceId = workspace.Id,
            Email = request.Email,
            RoleId = request.RoleId,
            InvitedById = _currentUser.UserId!.Value,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _db.Invitations.Add(invitation);
        await _db.SaveChangesAsync();

        var inviter = await _db.Users.FindAsync(_currentUser.UserId!.Value);

        // Notify the invited user if they exist in the system
        var invitedUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (invitedUser != null)
        {
            await _notifications.SendAsync(invitedUser.Id, workspace.Id, NotificationType.Invitation,
                $"{inviter?.FirstName} {inviter?.LastName} invited you to {workspace.Name}",
                $"You've been invited to join the workspace \"{workspace.Name}\"",
                "invitation", invitation.Id, _currentUser.UserId!.Value);
        }

        // Also notify existing workspace members about new invite
        var existingMemberIds = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == workspace.Id && uwr.UserId != _currentUser.UserId!.Value)
            .Select(uwr => uwr.UserId)
            .ToListAsync();
        foreach (var mid in existingMemberIds)
        {
            await _notifications.SendAsync(mid, workspace.Id, NotificationType.Invitation,
                $"{inviter?.FirstName} invited a new member", request.Email, "workspace", workspace.Id, _currentUser.UserId!.Value);
        }

        return Ok(new { message = "Invitation sent", token = invitation.Token });
    }

    /// <summary>
    /// List pending invitations for a workspace
    /// </summary>
    [HttpGet("{slug}/invitations")]
    public async Task<IActionResult> GetInvitations(string slug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        var invitations = await _db.Invitations
            .Where(i => i.WorkspaceId == workspace.Id && i.Status == InvitationStatus.Pending)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                i.Email,
                RoleId = i.RoleId,
                RoleName = i.Role.Name,
                InvitedBy = i.InvitedBy.FirstName + " " + i.InvitedBy.LastName,
                i.ExpiresAt,
                i.CreatedAt,
                Status = i.Status.ToString()
            })
            .ToListAsync();

        return Ok(invitations);
    }

    /// <summary>
    /// Revoke a pending invitation
    /// </summary>
    [HttpDelete("{slug}/invitations/{invitationId:guid}")]
    public async Task<IActionResult> RevokeInvitation(string slug, Guid invitationId)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        var invitation = await _db.Invitations
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.WorkspaceId == workspace.Id);
        if (invitation == null) return NotFound(new { message = "Invitation not found" });

        invitation.Status = InvitationStatus.Revoked;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Invitation revoked" });
    }

    /// <summary>
    /// Directly add a registered user to the workspace by email
    /// </summary>
    [HttpPost("{slug}/members/add")]
    [RequirePermission("workspace.invite_member")]
    public async Task<IActionResult> AddMemberByEmail(string slug, [FromBody] AddMemberByEmailRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound(new { message = "No registered user found with this email" });

        // Check if already a member
        var existing = await _db.UserWorkspaceRoles
            .AnyAsync(uwr => uwr.UserId == user.Id && uwr.WorkspaceId == workspace.Id);
        if (existing) return BadRequest(new { message = "User is already a member of this workspace" });

        // Verify role exists
        var role = await _db.Roles.FirstOrDefaultAsync(r =>
            r.Id == request.RoleId && (r.WorkspaceId == null || r.WorkspaceId == workspace.Id));
        if (role == null) return BadRequest(new { message = "Invalid role" });

        _db.UserWorkspaceRoles.Add(new UserWorkspaceRole
        {
            UserId = user.Id,
            WorkspaceId = workspace.Id,
            RoleId = request.RoleId
        });
        await _db.SaveChangesAsync();

        await _activity.LogActivityAsync(workspace.Id, _currentUser.UserId!.Value, "Workspace", workspace.Id, "MemberAdded", $"Added user {user.Email} to workspace");

        // Notify the added user
        var adder = await _db.Users.FindAsync(_currentUser.UserId!.Value);
        await _notifications.SendAsync(user.Id, workspace.Id, NotificationType.Invitation,
            $"{adder?.FirstName} added you to {workspace.Name}", $"You now have access to workspace: {workspace.Name}", "workspace", workspace.Id, _currentUser.UserId!.Value);

        // Notify existing workspace members
        var memberIds = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == workspace.Id && uwr.UserId != _currentUser.UserId!.Value && uwr.UserId != user.Id)
            .Select(uwr => uwr.UserId)
            .ToListAsync();
        foreach (var mid in memberIds)
        {
            await _notifications.SendAsync(mid, workspace.Id, NotificationType.Mention,
                $"{adder?.FirstName} added a new member", $"{user.FirstName} {user.LastName} joined the workspace", "workspace", workspace.Id, _currentUser.UserId!.Value);
        }

        return Ok(new { message = "Member added", userId = user.Id, email = user.Email, firstName = user.FirstName, lastName = user.LastName });
    }

    /// <summary>
    /// Accept a workspace invitation (called by the invited user)
    /// </summary>
    [HttpPost("invitations/{invitationId:guid}/accept")]
    public async Task<IActionResult> AcceptInvitation(Guid invitationId)
    {
        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var invitation = await _db.Invitations
            .Include(i => i.Workspace)
            .Include(i => i.Role)
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.Email == user.Email);

        if (invitation == null) return NotFound(new { message = "Invitation not found" });
        if (invitation.Status != InvitationStatus.Pending) return BadRequest(new { message = "Invitation is no longer valid" });
        if (invitation.ExpiresAt < DateTime.UtcNow) return BadRequest(new { message = "Invitation has expired" });

        // Check if already a member
        var alreadyMember = await _db.UserWorkspaceRoles
            .AnyAsync(uwr => uwr.UserId == userId && uwr.WorkspaceId == invitation.WorkspaceId);
        if (alreadyMember) return BadRequest(new { message = "You are already a member of this workspace" });

        // Add user to workspace with the invited role
        _db.UserWorkspaceRoles.Add(new UserWorkspaceRole
        {
            UserId = userId,
            WorkspaceId = invitation.WorkspaceId,
            RoleId = invitation.RoleId
        });

        invitation.Status = InvitationStatus.Accepted;
        invitation.AcceptedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // Notify workspace members about new member
        var memberIds = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == invitation.WorkspaceId && uwr.UserId != userId)
            .Select(uwr => uwr.UserId)
            .ToListAsync();
        foreach (var mid in memberIds)
        {
            await _notifications.SendAsync(mid, invitation.WorkspaceId, NotificationType.Mention,
                $"{user.FirstName} joined {invitation.Workspace.Name}",
                $"{user.FirstName} {user.LastName} accepted an invitation",
                "workspace", invitation.WorkspaceId, userId);
        }

        return Ok(new { message = "Invitation accepted", workspaceSlug = invitation.Workspace.Slug, workspaceName = invitation.Workspace.Name });
    }

    /// <summary>
    /// Decline a workspace invitation (called by the invited user)
    /// </summary>
    [HttpPost("invitations/{invitationId:guid}/decline")]
    public async Task<IActionResult> DeclineInvitation(Guid invitationId)
    {
        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var invitation = await _db.Invitations
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.Email == user.Email);

        if (invitation == null) return NotFound(new { message = "Invitation not found" });
        if (invitation.Status != InvitationStatus.Pending) return BadRequest(new { message = "Invitation is no longer valid" });

        invitation.Status = InvitationStatus.Revoked;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Invitation declined" });
    }

    /// <summary>
    /// Leave a workspace (non-owner only)
    /// </summary>
    [HttpPost("{slug}/leave")]
    public async Task<IActionResult> LeaveWorkspace(string slug)
    {
        var userId = _currentUser.UserId!.Value;
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        if (workspace.OwnerId == userId)
            return BadRequest(new { message = "Owner cannot leave. Transfer ownership first or delete the workspace." });

        var membership = await _db.UserWorkspaceRoles
            .FirstOrDefaultAsync(uwr => uwr.UserId == userId && uwr.WorkspaceId == workspace.Id);
        if (membership == null) return BadRequest(new { message = "You are not a member of this workspace" });

        _db.UserWorkspaceRoles.Remove(membership);
        await _db.SaveChangesAsync();

        // Notify remaining members
        var user = await _db.Users.FindAsync(userId);
        var memberIds = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == workspace.Id)
            .Select(uwr => uwr.UserId)
            .ToListAsync();
        foreach (var mid in memberIds)
        {
            await _notifications.SendAsync(mid, workspace.Id, NotificationType.StatusChanged,
                $"{user?.FirstName} left {workspace.Name}", null, "workspace", workspace.Id, userId);
        }

        return Ok(new { message = "You have left the workspace" });
    }

    /// <summary>
    /// Delete a workspace (owner only)
    /// </summary>
    [HttpDelete("{slug}")]
    public async Task<IActionResult> DeleteWorkspace(string slug)
    {
        var userId = _currentUser.UserId!.Value;
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        if (workspace.OwnerId != userId)
            return Forbid();

        // Notify members before deleting
        var memberIds = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == workspace.Id && uwr.UserId != userId)
            .Select(uwr => uwr.UserId)
            .ToListAsync();

        var user = await _db.Users.FindAsync(userId);
        foreach (var mid in memberIds)
        {
            await _notifications.SendAsync(mid, workspace.Id, NotificationType.StatusChanged,
                $"{workspace.Name} has been deleted", $"The workspace was deleted by {user?.FirstName}", "workspace", workspace.Id, userId);
        }

        // Remove all related data
        _db.UserWorkspaceRoles.RemoveRange(_db.UserWorkspaceRoles.Where(uwr => uwr.WorkspaceId == workspace.Id));
        _db.Invitations.RemoveRange(_db.Invitations.Where(i => i.WorkspaceId == workspace.Id));
        _db.Workspaces.Remove(workspace);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Workspace deleted" });
    }

    /// <summary>
    /// Transfer workspace ownership to another member
    /// </summary>
    [HttpPost("{slug}/transfer")]
    public async Task<IActionResult> TransferOwnership(string slug, [FromBody] TransferOwnershipRequest request)
    {
        var userId = _currentUser.UserId!.Value;
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        if (workspace.OwnerId != userId)
            return Forbid();

        // Verify target is a member
        var targetMember = await _db.UserWorkspaceRoles
            .AnyAsync(uwr => uwr.UserId == request.NewOwnerId && uwr.WorkspaceId == workspace.Id);
        if (!targetMember)
            return BadRequest(new { message = "Target user is not a member of this workspace" });

        workspace.OwnerId = request.NewOwnerId;
        await _db.SaveChangesAsync();

        var newOwner = await _db.Users.FindAsync(request.NewOwnerId);
        if (newOwner != null)
        {
            await _activity.LogActivityAsync(workspace.Id, userId, "Workspace", workspace.Id, "OwnershipTransferred", $"Transferred ownership to {newOwner.Email}");
        }

        // Notify the new owner
        var oldOwner = await _db.Users.FindAsync(userId);
        await _notifications.SendAsync(request.NewOwnerId, workspace.Id, NotificationType.StatusChanged,
            $"You are now the owner of {workspace.Name}",
            $"{oldOwner?.FirstName} transferred ownership to you",
            "workspace", workspace.Id, userId);

        return Ok(new { message = "Ownership transferred" });
    }

    /// <summary>
    /// Get pending invitations for the current user (across all workspaces)
    /// </summary>
    [HttpGet("my-invitations")]
    public async Task<IActionResult> GetMyInvitations()
    {
        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var invitations = await _db.Invitations
            .Where(i => i.Email == user.Email && i.Status == InvitationStatus.Pending && i.ExpiresAt > DateTime.UtcNow)
            .Include(i => i.Workspace)
            .Include(i => i.Role)
            .Include(i => i.InvitedBy)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.Id,
                WorkspaceName = i.Workspace.Name,
                WorkspaceSlug = i.Workspace.Slug,
                RoleName = i.Role.Name,
                InvitedBy = i.InvitedBy.FirstName + " " + i.InvitedBy.LastName,
                i.CreatedAt,
                i.ExpiresAt
            })
            .ToListAsync();

        return Ok(invitations);
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');
        return $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";
    }

    /// <summary>
    /// Global search across tasks and projects in a workspace
    /// </summary>
    [HttpGet("{slug}/search")]
    [RequireWorkspaceMember]
    public async Task<IActionResult> Search(string slug, [FromQuery] string q, [FromQuery] int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(new { tasks = Array.Empty<object>(), projects = Array.Empty<object>() });

        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        var tasks = await _db.Tasks
            .Where(t => t.Project.WorkspaceId == workspace.Id && !t.IsDeleted &&
                (EF.Functions.ILike(t.Title, $"%{q}%") || EF.Functions.ILike(t.Description ?? "", $"%{q}%")))
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .Select(t => new {
                t.Id, t.Title, t.Status, t.Priority,
                ProjectName = t.Project.Name, t.ProjectId
            }).ToListAsync();

        var projects = await _db.Projects
            .Where(p => p.WorkspaceId == workspace.Id && !p.IsDeleted &&
                (EF.Functions.ILike(p.Name, $"%{q}%") || EF.Functions.ILike(p.Description ?? "", $"%{q}%")))
            .Take(limit)
            .Select(p => new { p.Id, p.Name, p.Color, p.Icon, p.Status })
            .ToListAsync();

        return Ok(new { tasks, projects });
    }
}

public class ChangeMemberRoleRequest
{
    public Guid RoleId { get; set; }
}

public class TransferOwnershipRequest
{
    public Guid NewOwnerId { get; set; }
}

