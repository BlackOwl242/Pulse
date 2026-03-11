using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.AI;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/ai")]
[Authorize]
public class AIAssistantController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AIAssistantController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var conversations = await _db.AIConversations
            .Where(c => c.UserId == userId && c.WorkspaceId == workspace.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id, c.Context, c.ContextEntityId, c.CreatedAt,
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Content).FirstOrDefault(),
                MessageCount = c.Messages.Count
            })
            .Take(20)
            .ToListAsync();
        return Ok(conversations);
    }

    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<IActionResult> GetMessages(string workspaceSlug, Guid conversationId)
    {
        var messages = await _db.AIMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new { m.Id, m.Role, m.Content, m.TokensUsed, m.CreatedAt })
            .ToListAsync();
        return Ok(messages);
    }

    [HttpPost("conversations")]
    public async Task<IActionResult> StartConversation(string workspaceSlug, [FromBody] StartAIConversationRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var conversation = new AIConversation
        {
            UserId = userId,
            WorkspaceId = workspace.Id,
            Context = req.Context ?? "global",
            ContextEntityId = req.ContextEntityId
        };
        _db.AIConversations.Add(conversation);

        // Add user message
        var userMsg = new AIMessage
        {
            ConversationId = conversation.Id,
            Role = AIRole.User,
            Content = req.Message
        };
        _db.AIMessages.Add(userMsg);

        // Simulated AI response
        var aiMsg = new AIMessage
        {
            ConversationId = conversation.Id,
            Role = AIRole.Assistant,
            Content = GenerateSimulatedResponse(req.Message),
            TokensUsed = req.Message.Length / 4
        };
        _db.AIMessages.Add(aiMsg);

        await _db.SaveChangesAsync();
        return Ok(new
        {
            conversation.Id,
            Messages = new[] {
                new { userMsg.Id, userMsg.Role, userMsg.Content, userMsg.CreatedAt },
                new { aiMsg.Id, aiMsg.Role, aiMsg.Content, aiMsg.CreatedAt }
            }
        });
    }

    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<IActionResult> SendMessage(string workspaceSlug, Guid conversationId, [FromBody] AIMessageRequest req)
    {
        var userMsg = new AIMessage
        {
            ConversationId = conversationId,
            Role = AIRole.User,
            Content = req.Message
        };
        _db.AIMessages.Add(userMsg);

        var aiMsg = new AIMessage
        {
            ConversationId = conversationId,
            Role = AIRole.Assistant,
            Content = GenerateSimulatedResponse(req.Message),
            TokensUsed = req.Message.Length / 4
        };
        _db.AIMessages.Add(aiMsg);

        await _db.SaveChangesAsync();
        return Ok(new { UserMessage = new { userMsg.Id, userMsg.Content }, AIMessage = new { aiMsg.Id, aiMsg.Content } });
    }

    private static string GenerateSimulatedResponse(string prompt)
    {
        var lower = prompt.ToLower();
        if (lower.Contains("task") || lower.Contains("nhiệm vụ"))
            return "Based on your workspace data, I can help you manage tasks. Would you like me to create a new task, update priorities, or review your current workload?";
        if (lower.Contains("report") || lower.Contains("báo cáo"))
            return "I can generate reports for your workspace. What kind of report would you like? Options include: Task completion rates, Team workload distribution, or Time tracking summary.";
        if (lower.Contains("meeting") || lower.Contains("họp"))
            return "I can help schedule a meeting. Please provide the title, participants, and preferred time slot.";
        return "I'm your AI assistant for Pulse. I can help with task management, scheduling, reports, and more. What would you like to do?";
    }
}

public class StartAIConversationRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Context { get; set; }
    public Guid? ContextEntityId { get; set; }
}

public class AIMessageRequest
{
    public string Message { get; set; } = string.Empty;
}
