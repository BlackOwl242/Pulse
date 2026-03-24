using System.Text.Json;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Communication;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly ApplicationDbContext _db;

    public ActivityLogService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task LogActivityAsync(
        Guid workspaceId, 
        Guid actorId, 
        string entityType, 
        Guid entityId, 
        string action, 
        string description, 
        object? oldValues = null, 
        object? newValues = null)
    {
        var log = new ActivityLog
        {
            WorkspaceId = workspaceId,
            ActorId = actorId,
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            Description = description,
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
            CreatedAt = DateTime.UtcNow
        };

        _db.ActivityLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}
