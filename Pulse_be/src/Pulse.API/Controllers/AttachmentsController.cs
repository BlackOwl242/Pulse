using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Services.Interfaces;
using System.IO;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IWebHostEnvironment _env;

    public AttachmentsController(ApplicationDbContext db, ICurrentUserService currentUser, IWebHostEnvironment env)
    {
        _db = db;
        _currentUser = currentUser;
        _env = env;
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
    public async Task<IActionResult> AddAttachment(string workspaceSlug, Guid taskId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var userId = _currentUser.UserId!.Value;

        // Generate a safe unique filename
        var extension = Path.GetExtension(file.FileName);
        var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid():N}_{originalFileName}{extension}";
        
        // Define path
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "attachments");
        Directory.CreateDirectory(uploadsFolder); // Ensure directory exists
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // Save file physically
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/attachments/{uniqueFileName}";     

        var attachment = new TaskAttachment
        {
            TaskId = taskId,
            UploadedById = userId,
            FileName = file.FileName,
            FileUrl = fileUrl,
            FileType = file.ContentType,
            FileSize = file.Length
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

        // Try to delete physical file
        if (!string.IsNullOrEmpty(attachment.FileUrl))
        {
            var fileName = Path.GetFileName(attachment.FileUrl);
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "attachments");
            var physicalPath = Path.Combine(uploadsFolder, fileName);
            if (System.IO.File.Exists(physicalPath))
            {
                System.IO.File.Delete(physicalPath);
            }
        }

        _db.TaskAttachments.Remove(attachment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
