using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Identity;
using System.Security.Claims;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{slug}/roles")]
[Authorize]
[RequireWorkspaceMember]
public class RolesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public RolesController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// List all roles available in workspace (system + custom).
    /// Membership enforced by [RequireWorkspaceMember] at class level.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> GetRoles(string slug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound(new { message = "Workspace not found" });

        var roles = await _db.Roles
            .Where(r => r.WorkspaceId == null || r.WorkspaceId == workspace.Id)
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .OrderBy(r => r.IsSystem ? 0 : 1)
            .ThenBy(r => r.Name)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystem = r.IsSystem,
                Permissions = r.RolePermissions.Select(rp => new PermissionDto
                {
                    Id = rp.Permission.Id,
                    Module = rp.Permission.Module,
                    Action = rp.Permission.Action,
                    Resource = rp.Permission.Resource,
                    Description = rp.Permission.Description
                }).ToList()
            })
            .ToListAsync();

        return Ok(roles);
    }

    /// <summary>
    /// Create a custom role for this workspace
    /// </summary>
    [HttpPost]
    [RequirePermission("role.create")]
    public async Task<ActionResult<RoleDto>> CreateRole(string slug, [FromBody] CreateRoleRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == slug);
        if (workspace == null) return NotFound(new { message = "Workspace not found" });

        // Check duplicate name in workspace
        var exists = await _db.Roles.AnyAsync(r =>
            (r.WorkspaceId == workspace.Id || r.WorkspaceId == null) && r.Name == request.Name);
        if (exists) return Conflict(new { message = $"Role '{request.Name}' already exists" });

        var role = new Role
        {
            Name = request.Name,
            Description = request.Description,
            IsSystem = false,
            WorkspaceId = workspace.Id,
        };
        _db.Roles.Add(role);

        // Add permissions
        if (request.PermissionIds?.Any() == true)
        {
            var validPermissions = await _db.Permissions
                .Where(p => request.PermissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            foreach (var permId in validPermissions)
            {
                _db.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permId
                });
            }
        }

        await _db.SaveChangesAsync();

        // Return created role with permissions
        var dto = await GetRoleDto(role.Id);
        return CreatedAtAction(nameof(GetRole), new { slug, id = role.Id }, dto);
    }

    /// <summary>
    /// Get a single role with permissions
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("role.view")]
    public async Task<ActionResult<RoleDto>> GetRole(string slug, Guid id)
    {
        var dto = await GetRoleDto(id);
        if (dto == null) return NotFound(new { message = "Role not found" });
        return Ok(dto);
    }

    /// <summary>
    /// Update a custom role (name, description, permissions)
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("role.edit")]
    public async Task<ActionResult<RoleDto>> UpdateRole(string slug, Guid id, [FromBody] UpdateRoleRequest request)
    {
        var role = await _db.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound(new { message = "Role not found" });
        if (role.IsSystem) return BadRequest(new { message = "Cannot modify system roles" });

        role.Name = request.Name ?? role.Name;
        role.Description = request.Description ?? role.Description;

        // Replace permissions if provided
        if (request.PermissionIds != null)
        {
            _db.RolePermissions.RemoveRange(role.RolePermissions);

            var validPermissions = await _db.Permissions
                .Where(p => request.PermissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            foreach (var permId in validPermissions)
            {
                _db.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permId
                });
            }
        }

        await _db.SaveChangesAsync();

        var dto = await GetRoleDto(role.Id);
        return Ok(dto);
    }

    /// <summary>
    /// Delete a custom role (cannot delete system roles)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("role.delete")]
    public async Task<IActionResult> DeleteRole(string slug, Guid id)
    {
        var role = await _db.Roles
            .Include(r => r.RolePermissions)
            .Include(r => r.UserWorkspaceRoles)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound(new { message = "Role not found" });
        if (role.IsSystem) return BadRequest(new { message = "Cannot delete system roles" });
        if (role.UserWorkspaceRoles.Any())
            return Conflict(new { message = "Cannot delete role that is assigned to users. Reassign them first." });

        _db.RolePermissions.RemoveRange(role.RolePermissions);
        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// List all available permissions (for the role editor UI)
    /// </summary>
    [HttpGet("/api/permissions")]
    [Authorize]
    public async Task<ActionResult<List<PermissionGroupDto>>> GetAllPermissions()
    {
        var permissions = await _db.Permissions
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Action)
            .ToListAsync();

        var grouped = permissions
            .GroupBy(p => p.Module)
            .Select(g => new PermissionGroupDto
            {
                Module = g.Key,
                Permissions = g.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Module = p.Module,
                    Action = p.Action,
                    Resource = p.Resource,
                    Description = p.Description
                }).ToList()
            })
            .ToList();

        return Ok(grouped);
    }

    private async Task<RoleDto?> GetRoleDto(Guid roleId)
    {
        return await _db.Roles
            .Where(r => r.Id == roleId)
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystem = r.IsSystem,
                Permissions = r.RolePermissions.Select(rp => new PermissionDto
                {
                    Id = rp.Permission.Id,
                    Module = rp.Permission.Module,
                    Action = rp.Permission.Action,
                    Resource = rp.Permission.Resource,
                    Description = rp.Permission.Description
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }
}

// ===== DTOs =====

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystem { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class PermissionDto
{
    public Guid Id { get; set; }
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class PermissionGroupDto
{
    public string Module { get; set; } = string.Empty;
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<Guid>? PermissionIds { get; set; }
}

public class UpdateRoleRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<Guid>? PermissionIds { get; set; }
}
