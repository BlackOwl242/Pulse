using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CommentsController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
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
