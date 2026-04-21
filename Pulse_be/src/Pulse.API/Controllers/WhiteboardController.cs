using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Authorization;
using Pulse.API.Data;
using Pulse.API.Models;

namespace Pulse.API.Controllers;

[Authorize]
[ApiController]
[Route("api/workspaces/{workspaceSlug}/whiteboards")]
[RequireWorkspaceMember]
public class WhiteboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public WhiteboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> ListWhiteboards(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var boards = await _db.Whiteboards
            .Where(w => w.WorkspaceId == workspace.Id)
            .OrderByDescending(w => w.UpdatedAt)
            // don't send DataJson in list for performance
            .Select(w => new { w.Id, w.Title, w.CreatedAt, w.UpdatedAt }) 
            .ToListAsync();

        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWhiteboard(string workspaceSlug, Guid id)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var board = await _db.Whiteboards
            .FirstOrDefaultAsync(w => w.Id == id && w.WorkspaceId == workspace.Id);

        if (board == null) return NotFound();

        return Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWhiteboard(string workspaceSlug, [FromBody] CreateWhiteboardDto dto)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var board = new Whiteboard
        {
            WorkspaceId = workspace.Id,
            Title = string.IsNullOrWhiteSpace(dto.Title) ? "Untitled Whiteboard" : dto.Title,
            DataJson = dto.DataJson ?? "{}"
        };

        _db.Whiteboards.Add(board);
        await _db.SaveChangesAsync();

        return Ok(board);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWhiteboard(string workspaceSlug, Guid id, [FromBody] UpdateWhiteboardDto dto)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var board = await _db.Whiteboards
            .FirstOrDefaultAsync(w => w.Id == id && w.WorkspaceId == workspace.Id);

        if (board == null) return NotFound();

        if (dto.Title != null) board.Title = dto.Title;
        if (dto.DataJson != null) board.DataJson = dto.DataJson;

        board.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWhiteboard(string workspaceSlug, Guid id)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var board = await _db.Whiteboards
            .FirstOrDefaultAsync(w => w.Id == id && w.WorkspaceId == workspace.Id);

        if (board == null) return NotFound();

        _db.Whiteboards.Remove(board);
        await _db.SaveChangesAsync();
        
        return NoContent();
    }
}

public class CreateWhiteboardDto
{
    public string Title { get; set; } = string.Empty;
    public string? DataJson { get; set; }
}

public class UpdateWhiteboardDto
{
    public string? Title { get; set; }
    public string? DataJson { get; set; }
}
