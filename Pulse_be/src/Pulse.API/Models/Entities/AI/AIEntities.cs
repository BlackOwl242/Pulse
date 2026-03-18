using Pulse.API.Models.Common;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.Identity;

namespace Pulse.API.Models.Entities.AI;

public class AIConversation : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid WorkspaceId { get; set; }
    public string? Title { get; set; }
    public string Context { get; set; } = "global"; // "chat" | "task" | "global"
    public Guid? ContextEntityId { get; set; }

    public ICollection<AIMessage> Messages { get; set; } = new List<AIMessage>();
    public ICollection<AIActionLog> ActionLogs { get; set; } = new List<AIActionLog>();
}

public class AIMessage : BaseEntity
{
    public Guid ConversationId { get; set; }
    public AIConversation Conversation { get; set; } = null!;
    public AIRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ToolCalls { get; set; } // JSON
    public int TokensUsed { get; set; }
}

public class AIActionLog : BaseEntity
{
    public Guid ConversationId { get; set; }
    public AIConversation Conversation { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string ActionType { get; set; } = string.Empty;
    public string? ActionPayload { get; set; } // JSON
    public string? ActionResult { get; set; } // JSON
    public AIActionStatus Status { get; set; } = AIActionStatus.Pending;
    public DateTime? ExecutedAt { get; set; }
}
