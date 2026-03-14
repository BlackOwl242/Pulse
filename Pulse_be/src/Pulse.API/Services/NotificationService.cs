using Microsoft.AspNetCore.SignalR;
using Pulse.API.Data;
using Pulse.API.Hubs;
using Pulse.API.Models.Entities.Communication;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(ApplicationDbContext db, IHubContext<NotificationHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task SendAsync(
        Guid userId,
        Guid workspaceId,
        NotificationType type,
        string title,
        string? content = null,
        string? entityType = null,
        Guid? entityId = null,
        Guid? actorId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            WorkspaceId = workspaceId,
            Type = type,
            Title = title,
            Content = content,
            EntityType = entityType,
            EntityId = entityId,
            ActorId = actorId,
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        // Push real-time via SignalR to user group
        await _hub.Clients.Group($"user_{userId}")
            .SendAsync("ReceiveNotification", new
            {
                notification.Id,
                notification.Type,
                notification.Title,
                notification.Content,
                notification.EntityType,
                notification.EntityId,
                notification.IsRead,
                notification.CreatedAt,
                actorId
            });
    }
}
