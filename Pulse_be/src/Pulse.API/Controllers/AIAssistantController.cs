using Microsoft.AspNetCore.Authorization;
using Pulse.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.AI;
using Pulse.API.Models.Entities.Organization;
using Pulse.API.Models.Enums;
using Pulse.API.Services;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/ai")]
[Authorize]
[RequireWorkspaceMember]
public class AIAssistantController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IPicoClawService _picoClaw;
    private readonly IAIActionExecutor _actionExecutor;

    public AIAssistantController(ApplicationDbContext db, ICurrentUserService currentUser, IPicoClawService picoClaw, IAIActionExecutor actionExecutor)
    {
        _db = db;
        _currentUser = currentUser;
        _picoClaw = picoClaw;
        _actionExecutor = actionExecutor;
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
                c.Id, c.Title, c.Context, c.ContextEntityId, c.CreatedAt,
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
            Title = req.Message.Length > 60 ? req.Message[..57] + "..." : req.Message,
            Context = req.Context ?? "global",
            ContextEntityId = req.ContextEntityId
        };
        _db.AIConversations.Add(conversation);

        var userMsg = new AIMessage
        {
            ConversationId = conversation.Id,
            Role = AIRole.User,
            Content = req.Message
        };
        _db.AIMessages.Add(userMsg);

        // Build rich context
        var contextData = await BuildWorkspaceContextAsync(workspace, userId, workspaceSlug);

        var picoResponse = await _picoClaw.SendRequestAsync(
            action: "analyze_task",
            message: req.Message,
            data: contextData);

        // Execute actions if any
        var actionResults = new List<Services.ActionResult>();
        if (picoResponse.Actions.Count > 0)
        {
            actionResults = await _actionExecutor.ExecuteActionsAsync(picoResponse.Actions, workspace.Id, userId);
            await LogActionsAsync(conversation.Id, actionResults);
        }

        var aiContent = BuildAIContent(picoResponse.Content, actionResults);
        var aiMsg = new AIMessage
        {
            ConversationId = conversation.Id,
            Role = AIRole.Assistant,
            Content = aiContent,
            TokensUsed = aiContent.Length / 4
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
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;

        var userMsg = new AIMessage
        {
            ConversationId = conversationId,
            Role = AIRole.User,
            Content = req.Message
        };
        _db.AIMessages.Add(userMsg);

        // Build conversation history
        var recentMessages = await _db.AIMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(10)
            .OrderBy(m => m.CreatedAt)
            .Select(m => $"{(m.Role == AIRole.User ? "User" : "Assistant")}: {m.Content}")
            .ToListAsync();
        var conversationHistory = string.Join("\n", recentMessages);

        // Build rich context
        var contextData = await BuildWorkspaceContextAsync(workspace, userId, workspaceSlug);
        contextData["conversationId"] = conversationId.ToString();
        contextData["history"] = conversationHistory;

        var picoResponse = await _picoClaw.SendRequestAsync(
            action: "analyze_task",
            message: req.Message,
            data: contextData);

        // Execute actions if any
        var actionResults = new List<Services.ActionResult>();
        if (picoResponse.Actions.Count > 0)
        {
            actionResults = await _actionExecutor.ExecuteActionsAsync(picoResponse.Actions, workspace.Id, userId);
            await LogActionsAsync(conversationId, actionResults);
        }

        var aiContent = BuildAIContent(picoResponse.Content, actionResults);
        var aiMsg = new AIMessage
        {
            ConversationId = conversationId,
            Role = AIRole.Assistant,
            Content = aiContent,
            TokensUsed = aiContent.Length / 4
        };
        _db.AIMessages.Add(aiMsg);

        await _db.SaveChangesAsync();
        return Ok(new { UserMessage = new { userMsg.Id, userMsg.Content }, AIMessage = new { aiMsg.Id, Content = aiContent } });
    }

    private async Task LogActionsAsync(Guid conversationId, List<Services.ActionResult> results)
    {
        var userId = _currentUser.UserId!.Value;
        foreach (var r in results)
        {
            _db.AIActionLogs.Add(new AIActionLog
            {
                ConversationId = conversationId,
                UserId = userId,
                ActionType = r.Type,
                ActionPayload = System.Text.Json.JsonSerializer.Serialize(new { r.Type, r.EntityId }),
                ActionResult = r.Message,
                Status = r.Success ? AIActionStatus.Executed : AIActionStatus.Failed,
                ExecutedAt = DateTime.UtcNow
            });
        }
    }

    private static string BuildAIContent(string reply, List<Services.ActionResult> results)
    {
        if (results.Count == 0) return reply;

        var sb = new System.Text.StringBuilder(reply);
        sb.AppendLine();
        sb.AppendLine();
        sb.AppendLine("---");
        sb.AppendLine("**Executed Actions:**");
        foreach (var r in results)
        {
            var icon = r.Success ? "✅" : "❌";
            sb.AppendLine($"{icon} `{r.Type}`: {r.Message}");
        }
        return sb.ToString();
    }

    private async Task<Dictionary<string, object>> BuildWorkspaceContextAsync(Workspace workspace, Guid userId, string workspaceSlug)
    {
        // Get user info
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var userRole = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.UserId == userId && uwr.WorkspaceId == workspace.Id)
            .Select(uwr => uwr.Role.Name)
            .FirstOrDefaultAsync();

        // Get user's assigned tasks (active ones)
        var myTasks = await _db.Tasks
            .Where(t => t.Project.WorkspaceId == workspace.Id &&
                        t.Assignees.Any(a => a.UserId == userId) &&
                        t.Status != TaskItemStatus.Done && t.Status != TaskItemStatus.Cancelled)
            .OrderByDescending(t => t.Priority)
            .Take(15)
            .Select(t => new
            {
                t.Title,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                Project = t.Project.Name,
                DueDate = t.Deadline
            })
            .ToListAsync();

        // Get workspace projects with progress
        var projects = await _db.Projects
            .Where(p => p.WorkspaceId == workspace.Id)
            .Select(p => new
            {
                p.Name,
                p.Description,
                TotalTasks = p.Tasks.Count(),
                CompletedTasks = p.Tasks.Count(t => t.Status == TaskItemStatus.Done),
                InProgressTasks = p.Tasks.Count(t => t.Status == TaskItemStatus.InProgress)
            })
            .ToListAsync();

        // Get upcoming meetings (next 7 days)
        var now = DateTime.UtcNow;
        var nextWeek = now.AddDays(7);
        var meetings = await _db.Meetings
            .Where(m => m.WorkspaceId == workspace.Id &&
                        m.ProposedStartTime >= now && m.ProposedStartTime <= nextWeek)
            .OrderBy(m => m.ProposedStartTime)
            .Take(5)
            .Select(m => new
            {
                m.Title,
                StartTime = m.ProposedStartTime,
                EndTime = m.ProposedEndTime,
                ParticipantCount = m.Participants.Count
            })
            .ToListAsync();

        // Get team members count
        var memberCount = await _db.UserWorkspaceRoles
            .Where(uwr => uwr.WorkspaceId == workspace.Id)
            .Select(uwr => uwr.UserId)
            .Distinct()
            .CountAsync();

        return new Dictionary<string, object>
        {
            ["workspace"] = new { workspace.Name, Slug = workspaceSlug, Plan = workspace.Plan.ToString(), MemberCount = memberCount },
            ["user"] = new { user?.FirstName, user?.LastName, user?.Email, Role = userRole ?? "Member" },
            ["myTasks"] = myTasks,
            ["projects"] = projects,
            ["upcomingMeetings"] = meetings,
            ["systemInfo"] = "Pulse is a project management platform with Tasks, Projects, Chat, Calendar, OKR, Time Tracking, Teams, and Analytics modules."
        };
    }

    [HttpPatch("conversations/{conversationId}/rename")]
    public async Task<IActionResult> RenameConversation(string workspaceSlug, Guid conversationId, [FromBody] RenameConversationRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var conversation = await _db.AIConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);
        if (conversation == null) return NotFound();

        conversation.Title = req.Title;
        await _db.SaveChangesAsync();
        return Ok(new { conversation.Id, conversation.Title });
    }

    [HttpDelete("conversations/{conversationId}")]
    public async Task<IActionResult> DeleteConversation(string workspaceSlug, Guid conversationId)
    {
        var userId = _currentUser.UserId!.Value;
        var conversation = await _db.AIConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);
        if (conversation == null) return NotFound();

        var messages = _db.AIMessages.Where(m => m.ConversationId == conversationId);
        _db.AIMessages.RemoveRange(messages);

        var actionLogs = _db.AIActionLogs.Where(a => a.ConversationId == conversationId);
        _db.AIActionLogs.RemoveRange(actionLogs);

        _db.AIConversations.Remove(conversation);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Check PicoClaw MCP server health status
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckHealth()
    {
        var isHealthy = await _picoClaw.CheckHealthAsync();
        return Ok(new
        {
            status = isHealthy ? "connected" : "disconnected",
            service = "PicoClaw MCP Server",
            timestamp = DateTime.UtcNow
        });
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

public class RenameConversationRequest
{
    public string Title { get; set; } = string.Empty;
}
