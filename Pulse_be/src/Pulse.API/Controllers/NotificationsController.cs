using Microsoft.AspNetCore.Authorization;
using Pulse.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
[RequireWorkspaceMember]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetAll(string workspaceSlug, [FromQuery] int limit = 20)
    {
        var userId = _currentUser.UserId!.Value;
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && n.WorkspaceId == workspace.Id)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .Select(n => new
            {
                n.Id, n.Type, n.Title, n.Content, n.EntityType, n.EntityId,
                n.IsRead, n.ReadAt, n.CreatedAt,
                Actor = n.Actor != null ? new { n.Actor.Id, n.Actor.FirstName, n.Actor.LastName, n.Actor.AvatarUrl } : null
            })
            .ToListAsync();

        var unreadCount = await _db.Notifications
            .CountAsync(n => n.UserId == userId && n.WorkspaceId == workspace.Id && !n.IsRead);

        return Ok(new { notifications, unreadCount });
    }

    [HttpPut("notifications/{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(string workspaceSlug, Guid notificationId)
    {
        var notification = await _db.Notifications.FindAsync(notificationId);
        if (notification == null) return NotFound();
        if (notification.UserId != _currentUser.UserId!.Value) return Forbid();

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("notifications/read-all")]
    public async Task<IActionResult> MarkAllAsRead(string workspaceSlug)
    {
        var userId = _currentUser.UserId!.Value;
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        await _db.Notifications
            .Where(n => n.UserId == userId && n.WorkspaceId == workspace.Id && !n.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsRead, true)
                .SetProperty(n => n.ReadAt, DateTime.UtcNow));

        return NoContent();
    }
}
