using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;

namespace Pulse.API.Models.Entities.Communication;

public class ChatChannel : BaseEntity, ISoftDeletable
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public ChannelType Type { get; set; }
    public string? Name { get; set; }
    public Guid? TaskId { get; set; }
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public ICollection<ChatChannelMember> Members { get; set; } = new List<ChatChannelMember>();
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();

    // Self-destruct timer (seconds). null = off
    public int? SelfDestructSeconds { get; set; }

    // Soft delete
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }
}

public class ChatChannelMember
{
    public Guid ChannelId { get; set; }
    public ChatChannel Channel { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastReadAt { get; set; }
    public bool IsMuted { get; set; }
    public DateTime? HiddenAt { get; set; }
    public ChannelMemberRole Role { get; set; } = ChannelMemberRole.Member;
}

public class ChatMessage : BaseEntity, ISoftDeletable
{
    public Guid ChannelId { get; set; }
    public ChatChannel Channel { get; set; } = null!;
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; } = MessageType.Text;
    public Guid? ReplyToId { get; set; }
    public ChatMessage? ReplyTo { get; set; }
    public bool IsEdited { get; set; }

    // Attachment support
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; } // e.g. "image", "video", "audio"

    // Soft delete
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Self-destruct: set when ALL non-sender members have viewed the message
    public DateTime? DeleteAfterAt { get; set; }

    // Read receipts
    public ICollection<MessageReadReceipt> ReadReceipts { get; set; } = new List<MessageReadReceipt>();
}

public class MessageReadReceipt
{
    public Guid MessageId { get; set; }
    public ChatMessage Message { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime ReadAt { get; set; } = DateTime.UtcNow;
}

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public Guid? ActorId { get; set; }
    public User? Actor { get; set; }
    public NotificationChannel Channel { get; set; } = NotificationChannel.InApp;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class ActivityLog : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; } // JSON
    public string? NewValues { get; set; } // JSON
    public string Description { get; set; } = string.Empty;
}
