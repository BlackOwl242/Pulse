using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Pulse.API.Hubs;

[Authorize]
public class WhiteboardHub : Hub
{
    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"wb_{boardId}");
    }

    public async Task LeaveBoard(string boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"wb_{boardId}");
    }

    // Broadcast partial updates (used for real-time multiplayer)
    public async Task SendUpdate(string boardId, string updatePayload)
    {
        var userId = Context.UserIdentifier;
        await Clients.OthersInGroup($"wb_{boardId}")
            .SendAsync("ReceiveUpdate", new { userId, updatePayload });
    }
    // Broadcast title changes
    public async Task SendRename(string boardId, string newTitle)
    {
        await Clients.OthersInGroup($"wb_{boardId}")
            .SendAsync("ReceiveRename", new { boardId, newTitle });
    }
}
