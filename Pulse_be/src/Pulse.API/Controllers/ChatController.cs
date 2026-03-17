using Microsoft.AspNetCore.Authorization;
using Pulse.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Hubs;
using Pulse.API.Models.Entities.Communication;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/chat")]
[Authorize]
[RequireWorkspaceMember]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IHubContext<ChatHub> _chatHub;
    private readonly IWebHostEnvironment _env;
    private readonly INotificationService _notifications;

    public ChatController(ApplicationDbContext db, ICurrentUserService currentUser, IHubContext<ChatHub> chatHub, IWebHostEnvironment env, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _chatHub = chatHub;
        _env = env;
        _notifications = notifications;
    }

    [HttpGet("channels")]
    public async Task<IActionResult> GetChannels(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var channels = await _db.ChatChannels
            .Where(c => c.WorkspaceId == workspace.Id && !c.IsDeleted && c.Members.Any(m => m.UserId == userId && (m.HiddenAt == null || c.Messages.Any(msg => msg.CreatedAt > m.HiddenAt))))
            .Select(c => new
            {
                c.Id, c.Name, c.Type, c.SelfDestructSeconds, c.CreatedById,
                IsMuted = c.Members.Where(m => m.UserId == userId).Select(m => m.IsMuted).FirstOrDefault(),
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => new
                {
                    m.Content, m.CreatedAt,
                    Sender = new { m.Sender.FirstName, m.Sender.LastName },
                    Status = m.ReadReceipts.Any(r => r.UserId != m.SenderId) ? "seen" : "sent"
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

        // Add creator with Creator role
        _db.ChatChannelMembers.Add(new ChatChannelMember { ChannelId = channel.Id, UserId = userId, Role = ChannelMemberRole.Creator });

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
                m.AttachmentUrl, m.AttachmentName, m.AttachmentType,
                m.DeleteAfterAt,
                Sender = new { m.Sender.Id, m.Sender.FirstName, m.Sender.LastName, m.Sender.AvatarUrl },
                Status = m.ReadReceipts.Any(r => r.UserId != m.SenderId) ? "seen" : "sent",
                ReadByCount = m.ReadReceipts.Count(r => r.UserId != m.SenderId)
            })
            .ToListAsync();

        // Mark channel as read
        member.LastReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(messages);
    }

    // ─── Mark messages as read ───
    [HttpPost("channels/{channelId}/mark-read")]
    public async Task<IActionResult> MarkAsRead(string workspaceSlug, Guid channelId, [FromBody] MarkReadRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var member = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (member == null) return Forbid();

        if (req.MessageIds == null || req.MessageIds.Count == 0)
            return Ok();

        // Get existing receipts for this user to avoid duplicates
        var existingReceipts = await _db.MessageReadReceipts
            .Where(r => req.MessageIds.Contains(r.MessageId) && r.UserId == userId)
            .Select(r => r.MessageId)
            .ToListAsync();

        var newIds = req.MessageIds.Except(existingReceipts).ToList();
        if (newIds.Count == 0) return Ok();

        foreach (var msgId in newIds)
        {
            _db.MessageReadReceipts.Add(new MessageReadReceipt
            {
                MessageId = msgId,
                UserId = userId
            });
        }
        await _db.SaveChangesAsync();

        // Broadcast status updates via SignalR
        var updatedStatuses = await _db.ChatMessages
            .Where(m => newIds.Contains(m.Id))
            .Select(m => new
            {
                MessageId = m.Id,
                Status = m.ReadReceipts.Any(r => r.UserId != m.SenderId) ? "seen" : "sent",
                ReadByCount = m.ReadReceipts.Count(r => r.UserId != m.SenderId)
            })
            .ToListAsync();

        await _chatHub.Clients.Group($"channel_{channelId}")
            .SendAsync("MessageStatusUpdated", updatedStatuses);

        // Self-destruct: check if ALL non-sender members have read — start timer
        var channel = await _db.ChatChannels.Include(c => c.Members).FirstOrDefaultAsync(c => c.Id == channelId);
        if (channel?.SelfDestructSeconds != null)
        {
            var nonSenderMsgIds = await _db.ChatMessages
                .Where(m => newIds.Contains(m.Id) && m.SenderId != userId && m.DeleteAfterAt == null)
                .Select(m => m.Id)
                .ToListAsync();

            if (nonSenderMsgIds.Count > 0)
            {
                var totalNonSenderMembers = channel.Members.Count; // all members count (we check per-message below)
                var readyToDeleteIds = new List<Guid>();

                foreach (var msgId in nonSenderMsgIds)
                {
                    var msg = await _db.ChatMessages.FindAsync(msgId);
                    if (msg == null) continue;

                    // Count of non-sender members for this specific message
                    var nonSenderMemberCount = channel.Members.Count(m => m.UserId != msg.SenderId);
                    var readCount = await _db.MessageReadReceipts.CountAsync(r => r.MessageId == msgId && r.UserId != msg.SenderId);

                    if (readCount >= nonSenderMemberCount)
                        readyToDeleteIds.Add(msgId);
                }

                if (readyToDeleteIds.Count > 0)
                {
                    var deleteAt = DateTime.UtcNow.AddSeconds(channel.SelfDestructSeconds.Value);
                    await _db.ChatMessages
                        .Where(m => readyToDeleteIds.Contains(m.Id))
                        .ExecuteUpdateAsync(s => s.SetProperty(m => m.DeleteAfterAt, deleteAt));

                    // Notify channel about the destruct timer
                    await _chatHub.Clients.Group($"channel_{channelId}")
                        .SendAsync("MessagesDestructStarted", new { messageIds = readyToDeleteIds, deleteAt });
                }
            }
        }

        return Ok();
    }

    // ─── Self-destruct timer endpoint ───
    [HttpPut("channels/{channelId}/destruct-timer")]
    public async Task<IActionResult> SetDestructTimer(string workspaceSlug, Guid channelId, [FromBody] SetDestructTimerRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var channel = await _db.ChatChannels.FindAsync(channelId);
        if (channel == null) return NotFound();

        channel.SelfDestructSeconds = req.Seconds;
        
        // Post system message to notify the channel
        var user = await _db.Users.FindAsync(userId);
        var label = req.Seconds == null ? "disabled" : GetTimerLabel(req.Seconds.Value);
        var sysContent = req.Seconds == null
            ? $"{user!.FirstName} turned off disappearing messages"
            : $"{user!.FirstName} set messages to disappear after {label}";

        var sysMessage = new ChatMessage
        {
            ChannelId = channelId,
            SenderId = userId,
            Content = sysContent,
            Type = MessageType.System
        };
        _db.ChatMessages.Add(sysMessage);
        await _db.SaveChangesAsync();

        var sender = await _db.Users.Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.AvatarUrl })
            .FirstOrDefaultAsync();

        await _chatHub.Clients.Group($"channel_{channelId}").SendAsync("ReceiveMessage", new
        {
            id = sysMessage.Id,
            channelId,
            content = sysContent,
            type = (int)MessageType.System,
            createdAt = sysMessage.CreatedAt,
            isEdited = false,
            sender
        });

        return Ok(new { seconds = req.Seconds });
    }

    private static string GetTimerLabel(int seconds) => seconds switch
    {
        10 => "10 seconds",
        30 => "30 seconds",
        60 => "1 minute",
        300 => "5 minutes",
        600 => "10 minutes",
        1800 => "30 minutes",
        3600 => "1 hour",
        86400 => "1 day",
        604800 => "1 week",
        _ => $"{seconds} seconds"
    };

    // ─── File serving endpoint (no auth required) ───
    [HttpGet("/api/files/chat/{fileName}")]
    [AllowAnonymous]
    public IActionResult ServeFile(string fileName)
    {
        // Sanitize to prevent directory traversal
        var safeFileName = Path.GetFileName(fileName);
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "chat", safeFileName);
        if (!System.IO.File.Exists(filePath)) return NotFound();

        var ext = Path.GetExtension(safeFileName).ToLowerInvariant();
        var contentTypes = new Dictionary<string, string>
        {
            [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg", [".png"] = "image/png",
            [".gif"] = "image/gif",  [".webp"] = "image/webp", [".avif"] = "image/avif",
            [".mp4"] = "video/mp4",  [".webm"] = "video/webm", [".mov"] = "video/quicktime",
            [".mp3"] = "audio/mpeg", [".wav"] = "audio/wav",   [".ogg"] = "audio/ogg",
            [".aac"] = "audio/aac",  [".m4a"] = "audio/mp4",
            [".pdf"] = "application/pdf",
        };
        var ct = contentTypes.TryGetValue(ext, out var v) ? v : "application/octet-stream";
        return PhysicalFile(filePath, ct);
    }

    // ─── File upload endpoint ───
    [HttpPost("channels/{channelId}/upload")]
    [RequestSizeLimit(1024L * 1024 * 1024)] // 1 GB
    public async Task<IActionResult> UploadAttachment(string workspaceSlug, Guid channelId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        // Store files in {ContentRootPath}/uploads/chat/ (not wwwroot)
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "chat");
        Directory.CreateDirectory(uploadsPath);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsPath, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Serve via dedicated endpoint — works regardless of static files config
        var url = $"{Request.Scheme}://{Request.Host}/api/files/chat/{fileName}";
        var contentType = file.ContentType ?? "";
        var attachmentType = contentType.StartsWith("image") ? "image"
                           : contentType.StartsWith("video") ? "video"
                           : contentType.StartsWith("audio") ? "audio"
                           : "file";

        return Ok(new { url, name = file.FileName, type = attachmentType });
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
            ReplyToId = req.ReplyToId,
            AttachmentUrl = req.AttachmentUrl,
            AttachmentName = req.AttachmentName,
            AttachmentType = req.AttachmentType,
        };
        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();

        var sender = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.AvatarUrl })
            .FirstOrDefaultAsync();

        await _chatHub.Clients.Group($"channel_{channelId}")
            .SendAsync("ReceiveMessage", new
            {
                id = message.Id,
                channelId = channelId,
                content = message.Content,
                type = (int)message.Type,
                createdAt = message.CreatedAt,
                isEdited = false,
                replyToId = message.ReplyToId,
                attachmentUrl = message.AttachmentUrl,
                attachmentName = message.AttachmentName,
                attachmentType = message.AttachmentType,
                sender = sender,
                status = "sent",
                readByCount = 0
            });

        // Send notifications to all other channel members
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace != null)
        {
            var otherMemberIds = await _db.ChatChannelMembers
                .Where(m => m.ChannelId == channelId && m.UserId != userId && !m.IsMuted)
                .Select(m => m.UserId)
                .ToListAsync();

            var preview = string.IsNullOrEmpty(req.Content) ? "sent an attachment" : req.Content.Length > 50 ? req.Content[..50] + "..." : req.Content;
            foreach (var memberId in otherMemberIds)
            {
                await _notifications.SendAsync(memberId, workspace.Id, NotificationType.Message,
                    $"{sender?.FirstName} sent a message", preview, "channel", channelId, userId);
            }
        }

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

    // ─── Mute/Unmute channel notifications ───
    [HttpPut("channels/{channelId}/mute")]
    public async Task<IActionResult> MuteChannel(string workspaceSlug, Guid channelId, [FromBody] MuteRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var member = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (member == null) return NotFound();

        member.IsMuted = req.Muted;
        await _db.SaveChangesAsync();
        return Ok(new { muted = member.IsMuted });
    }

    // ─── Admin: Get members with roles ───
    [HttpGet("channels/{channelId}/members")]
    public async Task<IActionResult> GetChannelMembers(string workspaceSlug, Guid channelId)
    {
        var userId = _currentUser.UserId!.Value;
        var isMember = await _db.ChatChannelMembers.AnyAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (!isMember) return Forbid();

        var channel = await _db.ChatChannels.FindAsync(channelId);
        var members = await _db.ChatChannelMembers
            .Where(m => m.ChannelId == channelId)
            .Select(m => new {
                m.UserId,
                m.User.FirstName,
                m.User.LastName,
                m.User.AvatarUrl,
                Role = m.Role.ToString().ToLower(),
                m.JoinedAt
            }).ToListAsync();

        return Ok(new { createdById = channel?.CreatedById, members });
    }

    // ─── Admin: Kick a member ───
    [HttpDelete("channels/{channelId}/members/{targetUserId}")]
    public async Task<IActionResult> KickMember(string workspaceSlug, Guid channelId, Guid targetUserId)
    {
        var userId = _currentUser.UserId!.Value;
        var caller = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (caller == null || caller.Role == ChannelMemberRole.Member) return Forbid();

        var target = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == targetUserId);
        if (target == null) return NotFound();
        if (target.Role == ChannelMemberRole.Creator) return BadRequest(new { message = "Cannot kick the creator" });
        if (target.Role == ChannelMemberRole.Admin && caller.Role != ChannelMemberRole.Creator)
            return BadRequest(new { message = "Only creator can kick admins" });

        _db.ChatChannelMembers.Remove(target);
        await _db.SaveChangesAsync();

        // Notify kicked user
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace != null)
        {
            var kickerName = (await _db.Users.FindAsync(userId))?.FirstName;
            await _notifications.SendAsync(targetUserId, workspace.Id, NotificationType.Mention,
                $"{kickerName} removed you from a chat", "", "channel", channelId, userId);
        }

        return NoContent();
    }

    // ─── Admin: Set member role (creator only) ───
    [HttpPut("channels/{channelId}/members/{targetUserId}/role")]
    public async Task<IActionResult> SetMemberRole(string workspaceSlug, Guid channelId, Guid targetUserId, [FromBody] SetRoleRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var caller = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (caller == null || caller.Role != ChannelMemberRole.Creator) return Forbid();

        var target = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == targetUserId);
        if (target == null) return NotFound();
        if (target.Role == ChannelMemberRole.Creator) return BadRequest(new { message = "Cannot change creator role" });

        target.Role = req.Role;
        await _db.SaveChangesAsync();
        return Ok(new { targetUserId, role = req.Role.ToString().ToLower() });
    }

    // ─── Admin: Delete channel for everyone (creator only) ───
    [HttpDelete("channels/{channelId}")]
    public async Task<IActionResult> DeleteChannel(string workspaceSlug, Guid channelId)
    {
        var userId = _currentUser.UserId!.Value;
        var caller = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (caller == null || caller.Role != ChannelMemberRole.Creator) return Forbid();

        // Soft-delete all messages
        await _db.ChatMessages
            .Where(m => m.ChannelId == channelId && !m.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.IsDeleted, true)
                .SetProperty(m => m.DeletedAt, DateTime.UtcNow));

        // Remove all members
        var members = await _db.ChatChannelMembers.Where(m => m.ChannelId == channelId).ToListAsync();
        _db.ChatChannelMembers.RemoveRange(members);

        // Soft-delete channel
        var channel = await _db.ChatChannels.FindAsync(channelId);
        if (channel != null)
        {
            channel.IsDeleted = true;
            channel.DeletedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ─── Admin: Kick all members (creator only) ───
    [HttpPost("channels/{channelId}/kick-all")]
    public async Task<IActionResult> KickAllMembers(string workspaceSlug, Guid channelId)
    {
        var userId = _currentUser.UserId!.Value;
        var caller = await _db.ChatChannelMembers.FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
        if (caller == null || caller.Role != ChannelMemberRole.Creator) return Forbid();

        var toRemove = await _db.ChatChannelMembers
            .Where(m => m.ChannelId == channelId && m.UserId != userId)
            .ToListAsync();

        _db.ChatChannelMembers.RemoveRange(toRemove);
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
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; }
}

public class SetDestructTimerRequest
{
    public int? Seconds { get; set; }
}

public class MarkReadRequest
{
    public List<Guid> MessageIds { get; set; } = new();
}

public class SetRoleRequest
{
    public ChannelMemberRole Role { get; set; }
}

public class MuteRequest
{
    public bool Muted { get; set; }
}
