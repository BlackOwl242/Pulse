using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Organization;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ProfileController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        return Ok(new
        {
            user.Id, user.FirstName, user.LastName, user.Email, user.AvatarUrl,
            JobTitle = profile?.JobTitle,
            Department = profile?.Department,
            Phone = profile?.Phone,
            Bio = profile?.Bio,
            Timezone = profile?.Timezone,
            Skills = profile?.Skills ?? new List<string>(),
        });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (req.FirstName != null) user.FirstName = req.FirstName;
        if (req.LastName != null) user.LastName = req.LastName;

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
        {
            profile = new UserProfile { UserId = userId };
            _db.UserProfiles.Add(profile);
        }

        if (req.JobTitle != null) profile.JobTitle = req.JobTitle;
        if (req.Department != null) profile.Department = req.Department;
        if (req.Phone != null) profile.Phone = req.Phone;
        if (req.Bio != null) profile.Bio = req.Bio;
        if (req.Timezone != null) profile.Timezone = req.Timezone;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file, [FromServices] IWebHostEnvironment env)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File size must be less than 5MB." });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Only JPG, PNG, WEBP, and GIF images are allowed." });

        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "avatars");
        Directory.CreateDirectory(uploadsFolder);

        // Delete old avatar if exists
        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            var oldFileName = Path.GetFileName(user.AvatarUrl);
            var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
            if (System.IO.File.Exists(oldFilePath))
                System.IO.File.Delete(oldFilePath);
        }

        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{userId:N}_{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.AvatarUrl = $"/uploads/avatars/{uniqueFileName}";
        await _db.SaveChangesAsync();

        return Ok(new { avatarUrl = user.AvatarUrl });
    }

    [HttpDelete("avatar")]
    public async Task<IActionResult> RemoveAvatar([FromServices] IWebHostEnvironment env)
    {
        var userId = _currentUser.UserId!.Value;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "avatars");
            var oldFileName = Path.GetFileName(user.AvatarUrl);
            var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
            
            if (System.IO.File.Exists(oldFilePath))
            {
                System.IO.File.Delete(oldFilePath);
            }

            user.AvatarUrl = null;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? Timezone { get; set; }
}
