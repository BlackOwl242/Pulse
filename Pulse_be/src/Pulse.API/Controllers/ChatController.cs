using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Communication;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ChatController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("channels")]
    public async Task<IActionResult> GetChannels(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var channels = await _db.ChatChannels
            .Where(c => c.WorkspaceId == workspace.Id && c.Members.Any(m => m.UserId == userId && (m.HiddenAt == null || c.Messages.Any(msg => msg.CreatedAt > m.HiddenAt))))
            .Select(c => new
            {
                c.Id, c.Name, c.Type,
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => new
                {
                    m.Content, m.CreatedAt,
                    Sender = new { m.Sender.FirstName, m.Sender.LastName }
                }).FirstOrDefault(),
                MemberCount = c.Members.Count,
                UnreadCount = c.Messages.Count(m => m.SenderId != userId && m.CreatedAt > (c.Members.First(mb => mb.UserId == userId).LastReadAt ?? DateTime.MinValue)),
                Members = c.Members.Select(m => new { m.UserId, m.User.FirstName, m.User.LastName, m.User.AvatarUrl }).ToList()
            })
            .ToListAsync();
        return Ok(channels);
    }

    [HttpPost("channels")]
    public async Task<IActionResult> CreateChannel(string workspaceSlug, [FromBody] CreateChannelRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var channel = new ChatChannel
        {
            WorkspaceId = workspace.Id,
            Name = req.Name,
            Type = req.Type,
            CreatedById = userId
        };
        _db.ChatChannels.Add(channel);

        // Add creator
        _db.ChatChannelMembers.Add(new ChatChannelMember { ChannelId = channel.Id, UserId = userId });

        // Add members
        foreach (var mid in req.MemberIds ?? new List<Guid>())
        {
            if (mid != userId)
                _db.ChatChannelMembers.Add(new ChatChannelMember { ChannelId = channel.Id, UserId = mid });
        }

        await _db.SaveChangesAsync();
        return Ok(new { channel.Id, channel.Name, channel.Type });
    }

    [HttpGet("channels/{channelId}/messages")]
    public async Task<IActionResult> GetMessages(string workspaceSlug, Guid channelId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        var userId = _currentUser.UserId!.Value;
        var member = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (member == null) return Forbid();

        var hiddenAt = member.HiddenAt;

        var messages = await _db.ChatMessages
            .Where(m => m.ChannelId == channelId && !m.IsDeleted && (hiddenAt == null || m.CreatedAt > hiddenAt))
            .OrderByDescending(m => m.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(m => new
            {
                m.Id, m.Content, m.Type, m.CreatedAt, m.IsEdited, m.ReplyToId,
                Sender = new { m.Sender.Id, m.Sender.FirstName, m.Sender.LastName, m.Sender.AvatarUrl }
            })
            .ToListAsync();

        // Mark channel as read
        if (member != null) { member.LastReadAt = DateTime.UtcNow; await _db.SaveChangesAsync(); }

        return Ok(messages);
    }

    [HttpPost("channels/{channelId}/messages")]
    public async Task<IActionResult> SendMessage(string workspaceSlug, Guid channelId, [FromBody] SendMessageRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var message = new ChatMessage
        {
            ChannelId = channelId,
            SenderId = userId,
            Content = req.Content,
            ReplyToId = req.ReplyToId
        };
        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();
        return Ok(new { message.Id, message.Content, message.CreatedAt });
    }

    [HttpDelete("messages/{messageId}")]
    public async Task<IActionResult> DeleteMessage(string workspaceSlug, Guid messageId)
    {
        var message = await _db.ChatMessages.FindAsync(messageId);
        if (message == null) return NotFound();
        message.IsDeleted = true;
        message.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("channels/{channelId}/hide")]
    public async Task<IActionResult> HideChannel(string workspaceSlug, Guid channelId)
    {
        var userId = _currentUser.UserId!.Value;
        var member = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (member == null) return NotFound();
        
        member.HiddenAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("channels/{channelId}/leave")]
    public async Task<IActionResult> LeaveChannel(string workspaceSlug, Guid channelId)
    {
        var userId = _currentUser.UserId!.Value;
        var member = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (member == null) return NotFound();

        _db.ChatChannelMembers.Remove(member);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateChannelRequest
{
    public string? Name { get; set; }
    public ChannelType Type { get; set; } = ChannelType.Group;
    public List<Guid>? MemberIds { get; set; }
}

public class SendMessageRequest
{
    public string Content { get; set; } = string.Empty;
    public Guid? ReplyToId { get; set; }
}
