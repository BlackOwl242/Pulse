using Pulse.API.Models.Entities.Communication;

namespace Pulse.API.Services.Interfaces;

public interface IActivityLogService
{
    Task LogActivityAsync(Guid workspaceId, Guid actorId, string entityType, Guid entityId, string action, string description, object? oldValues = null, object? newValues = null);
}
