using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Models.DTOs.Workspace;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;
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

    public WorkspacesController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
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
            .Select(uwr => new WorkspaceDto
            {
                Id = uwr.Workspace.Id,
                Name = uwr.Workspace.Name,
                Slug = uwr.Workspace.Slug,
                LogoUrl = uwr.Workspace.LogoUrl,
                Description = uwr.Workspace.Description,
                Plan = uwr.Workspace.Plan,
                MemberCount = uwr.Workspace.Members.Count,
                CreatedAt = uwr.Workspace.CreatedAt
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
    public async Task<IActionResult> Update(string slug, [FromBody] UpdateWorkspaceRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound();

        if (request.Name != null) workspace.Name = request.Name;
        if (request.Description != null) workspace.Description = request.Description;
        if (request.LogoUrl != null) workspace.LogoUrl = request.LogoUrl;

        await _db.SaveChangesAsync();
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

        // TODO: Send email via IEmailService

        return Ok(new { message = "Invitation sent", token = invitation.Token });
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
}

public class ChangeMemberRoleRequest
{
    public Guid RoleId { get; set; }
}

