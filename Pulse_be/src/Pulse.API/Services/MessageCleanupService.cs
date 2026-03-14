using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Hubs;

namespace Pulse.API.Services;

public class MessageCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<ChatHub> _chatHub;
    private readonly ILogger<MessageCleanupService> _logger;

    public MessageCleanupService(IServiceScopeFactory scopeFactory, IHubContext<ChatHub> chatHub, ILogger<MessageCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _chatHub = chatHub;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await DeleteExpiredMessages();
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }

    private async Task DeleteExpiredMessages()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;
            var expired = await db.ChatMessages
                .Where(m => m.DeleteAfterAt != null && m.DeleteAfterAt <= now && !m.IsDeleted)
                .Select(m => new { m.Id, m.ChannelId })
                .ToListAsync();

            if (!expired.Any()) return;

            var ids = expired.Select(m => m.Id).ToList();

            // Hard delete from DB
            await db.ChatMessages
                .Where(m => ids.Contains(m.Id))
                .ExecuteDeleteAsync();

            _logger.LogInformation("Deleted {Count} expired self-destruct messages", ids.Count);

            // Notify all affected channels via SignalR
            var byChannel = expired.GroupBy(m => m.ChannelId);
            foreach (var group in byChannel)
            {
                await _chatHub.Clients.Group($"channel_{group.Key}")
                    .SendAsync("MessagesDeleted", group.Select(m => m.Id).ToList());
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in MessageCleanupService");
        }
    }
}
