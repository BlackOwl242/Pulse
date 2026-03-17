using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/[controller]")]
[Authorize]
[RequireWorkspaceMember]
public class TeamsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public TeamsController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var teams = await _db.Teams
            .Where(t => t.WorkspaceId == workspace.Id)
            .Select(t => new
            {
                t.Id, t.Name, t.Description, t.Color, t.CreatedAt,
                MemberCount = t.Members.Count,
                Members = t.Members.Select(m => new
                {
                    m.User.Id, m.User.FirstName, m.User.LastName, m.User.AvatarUrl, m.Role
                })
            })
            .ToListAsync();

        return Ok(teams);
    }

    [HttpGet("{teamId}")]
    public async Task<IActionResult> GetById(string workspaceSlug, Guid teamId)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var team = await _db.Teams
            .Where(t => t.Id == teamId && t.WorkspaceId == workspace.Id)
            .Select(t => new
            {
                t.Id, t.Name, t.Description, t.Color, t.CreatedAt,
                MemberCount = t.Members.Count,
                Members = t.Members.Select(m => new
                {
                    m.User.Id, m.User.FirstName, m.User.LastName, m.User.Email, m.User.AvatarUrl, m.Role, m.JoinedAt
                })
            })
            .FirstOrDefaultAsync();

        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string workspaceSlug, [FromBody] CreateTeamRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var team = new Models.Entities.Organization.Team
        {
            WorkspaceId = workspace.Id,
            Name = request.Name,
            Description = request.Description,
            Color = request.Color,
            CreatedById = _currentUser.UserId!.Value,
        };

        _db.Teams.Add(team);

        // Add creator as team lead
        _db.TeamMembers.Add(new Models.Entities.Organization.TeamMember
        {
            TeamId = team.Id,
            UserId = _currentUser.UserId!.Value,
            Role = "lead"
        });

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { workspaceSlug }, new
        {
            team.Id, team.Name, team.Description, team.Color, team.CreatedAt,
            MemberCount = 1,
            Members = new[] { new { _currentUser.UserId, Role = "lead" } }
        });
    }

    [HttpPost("{teamId}/members")]
    public async Task<IActionResult> AddMember(string workspaceSlug, Guid teamId, [FromBody] AddTeamMemberRequest request)
    {
        var team = await _db.Teams.FindAsync(teamId);
        if (team == null) return NotFound();

        var member = new Models.Entities.Organization.TeamMember
        {
            TeamId = teamId,
            UserId = request.UserId,
            Role = request.Role ?? "member"
        };

        _db.TeamMembers.Add(member);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Member added", teamId, userId = request.UserId, role = member.Role });
    }

    [HttpDelete("{teamId}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid teamId, Guid userId)
    {
        var member = await _db.TeamMembers
            .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);

        if (member == null) return NotFound();

        _db.TeamMembers.Remove(member);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{teamId}")]
    public async Task<IActionResult> DeleteTeam(string workspaceSlug, Guid teamId)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var team = await _db.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId && t.WorkspaceId == workspace.Id);
        if (team == null) return NotFound();

        _db.TeamMembers.RemoveRange(team.Members);
        _db.Teams.Remove(team);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
}

public class AddTeamMemberRequest
{
    public Guid UserId { get; set; }
    public string? Role { get; set; }
}
