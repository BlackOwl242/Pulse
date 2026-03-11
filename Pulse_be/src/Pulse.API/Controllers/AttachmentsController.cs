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
public class AttachmentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AttachmentsController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("tasks/{taskId}/attachments")]
    public async Task<IActionResult> GetAttachments(string workspaceSlug, Guid taskId)
    {
        var attachments = await _db.TaskAttachments
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id, a.FileName, a.FileUrl, a.FileType, a.FileSize, a.CreatedAt,
                UploadedBy = new { a.UploadedBy.Id, a.UploadedBy.FirstName, a.UploadedBy.LastName }
            })
            .ToListAsync();
        return Ok(attachments);
    }

    [HttpPost("tasks/{taskId}/attachments")]
    public async Task<IActionResult> AddAttachment(string workspaceSlug, Guid taskId, [FromBody] AddAttachmentRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var attachment = new TaskAttachment
        {
            TaskId = taskId,
            UploadedById = userId,
            FileName = req.FileName,
            FileUrl = req.FileUrl,
            FileType = req.FileType,
            FileSize = req.FileSize
        };
        _db.TaskAttachments.Add(attachment);
        await _db.SaveChangesAsync();
        return Ok(new { attachment.Id, attachment.FileName, attachment.FileUrl, attachment.FileType, attachment.FileSize, attachment.CreatedAt });
    }

    [HttpDelete("attachments/{attachmentId}")]
    public async Task<IActionResult> DeleteAttachment(string workspaceSlug, Guid attachmentId)
    {
        var attachment = await _db.TaskAttachments.FindAsync(attachmentId);
        if (attachment == null) return NotFound();
        _db.TaskAttachments.Remove(attachment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class AddAttachmentRequest
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
}
