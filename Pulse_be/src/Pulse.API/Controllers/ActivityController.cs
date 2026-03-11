using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ActivityController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("activity")]
    public async Task<IActionResult> GetAll(string workspaceSlug, [FromQuery] int limit = 20)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var activities = await _db.ActivityLogs
            .Where(a => a.WorkspaceId == workspace.Id)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new
            {
                a.Id, a.EntityType, a.EntityId, a.Action, a.Description, a.CreatedAt,
                Actor = new { a.Actor.Id, a.Actor.FirstName, a.Actor.LastName, a.Actor.AvatarUrl }
            })
            .ToListAsync();

        return Ok(activities);
    }
}
