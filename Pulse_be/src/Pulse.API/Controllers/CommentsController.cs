using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public CommentsController(ApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    /// <summary>
    /// Get all comments for a task
    /// </summary>
    [HttpGet("tasks/{taskId}/comments")]
    public async Task<IActionResult> GetAll(string workspaceSlug, Guid taskId)
    {
        var comments = await _db.TaskComments
            .Where(c => c.TaskId == taskId && c.ParentCommentId == null)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                Author = new CommentAuthorDto
                {
                    Id = c.Author.Id,
                    FirstName = c.Author.FirstName,
                    LastName = c.Author.LastName,
                    AvatarUrl = c.Author.AvatarUrl
                },
                Replies = c.Replies.OrderBy(r => r.CreatedAt).Select(r => new CommentDto
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    Author = new CommentAuthorDto
                    {
                        Id = r.Author.Id,
                        FirstName = r.Author.FirstName,
                        LastName = r.Author.LastName,
                        AvatarUrl = r.Author.AvatarUrl
                    }
                }).ToList()
            })
            .ToListAsync();

        return Ok(comments);
    }

    /// <summary>
    /// Add a comment to a task
    /// </summary>
    [HttpPost("tasks/{taskId}/comments")]
    public async Task<IActionResult> Create(string workspaceSlug, Guid taskId, [FromBody] CreateCommentRequest request)
    {
        var userId = _currentUser.UserId!.Value;

        var comment = new TaskComment
        {
            TaskId = taskId,
            AuthorId = userId,
            Content = request.Content,
            ParentCommentId = request.ParentCommentId,
        };

        _db.TaskComments.Add(comment);
        await _db.SaveChangesAsync();

        // Re-fetch with author info
        var result = await _db.TaskComments
            .Where(c => c.Id == comment.Id)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                Author = new CommentAuthorDto
                {
                    Id = c.Author.Id,
                    FirstName = c.Author.FirstName,
                    LastName = c.Author.LastName,
                    AvatarUrl = c.Author.AvatarUrl
                }
            })
            .FirstAsync();

        // Notify task creator and assignees about the new comment
        var task = await _db.Tasks
            .Include(t => t.Assignees)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task != null)
        {
            var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
            if (workspace != null)
            {
                var recipients = task.Assignees
                    .Where(a => a.UserId != Guid.Empty)
                    .Select(a => a.UserId)
                    .ToHashSet();
                if (task.CreatedById.HasValue)
                    recipients.Add(task.CreatedById.Value);
                recipients.Remove(userId); // don't notify yourself

                foreach (var rid in recipients)
                {
                    await _notifications.SendAsync(rid, workspace.Id, NotificationType.Comment,
                        $"New comment on task: {task.Title}",
                        entityType: "task", entityId: task.Id, actorId: userId);
                }
            }
        }

        return CreatedAtAction(nameof(GetAll), new { workspaceSlug, taskId }, result);
    }

    /// <summary>
    /// Delete a comment
    /// </summary>
    [HttpDelete("comments/{commentId}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid commentId)
    {
        var comment = await _db.TaskComments.FindAsync(commentId);
        if (comment == null) return NotFound();

        // Only the author can delete their comment
        if (comment.AuthorId != _currentUser.UserId!.Value)
            return Forbid();

        _db.TaskComments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public CommentAuthorDto Author { get; set; } = null!;
    public List<CommentDto>? Replies { get; set; }
}

public class CommentAuthorDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}
