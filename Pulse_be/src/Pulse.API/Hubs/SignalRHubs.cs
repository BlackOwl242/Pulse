using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Pulse.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
        await base.OnDisconnectedAsync(exception);
    }
}

[Authorize]
public class ChatHub : Hub
{
    public async Task JoinChannel(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"channel_{channelId}");
    }

    public async Task LeaveChannel(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"channel_{channelId}");
    }

    public async Task SendMessage(string channelId, string message)
    {
        var userId = Context.UserIdentifier;
        await Clients.Group($"channel_{channelId}")
            .SendAsync("ReceiveMessage", new { userId, channelId, message, timestamp = DateTime.UtcNow });
    }

    public async Task TypingIndicator(string channelId)
    {
        var userId = Context.UserIdentifier;
        await Clients.OthersInGroup($"channel_{channelId}")
            .SendAsync("UserTyping", new { userId, channelId });
    }
}
