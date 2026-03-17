using Microsoft.AspNetCore.Authorization;
using Pulse.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
[RequireWorkspaceMember]
public class ChecklistsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ChecklistsController(ApplicationDbContext db) => _db = db;

    [HttpGet("tasks/{taskId}/checklists")]
    public async Task<IActionResult> GetAll(string workspaceSlug, Guid taskId)
    {
        var checklists = await _db.TaskChecklists
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.Position)
            .Select(c => new
            {
                c.Id, c.Title, c.Position,
                Items = c.Items.OrderBy(i => i.Position).Select(i => new
                {
                    i.Id, i.Content, i.IsCompleted, i.Position, i.CompletedAt
                }).ToList()
            })
            .ToListAsync();
        return Ok(checklists);
    }

    [HttpPost("tasks/{taskId}/checklists")]
    public async Task<IActionResult> CreateChecklist(string workspaceSlug, Guid taskId, [FromBody] CreateChecklistRequest req)
    {
        var maxPos = await _db.TaskChecklists.Where(c => c.TaskId == taskId).MaxAsync(c => (int?)c.Position) ?? -1;
        var checklist = new TaskChecklist { TaskId = taskId, Title = req.Title, Position = maxPos + 1 };
        _db.TaskChecklists.Add(checklist);
        await _db.SaveChangesAsync();
        return Ok(new { checklist.Id, checklist.Title, checklist.Position, Items = new List<object>() });
    }

    [HttpPost("checklists/{checklistId}/items")]
    public async Task<IActionResult> AddItem(string workspaceSlug, Guid checklistId, [FromBody] AddChecklistItemRequest req)
    {
        var maxPos = await _db.ChecklistItems.Where(i => i.ChecklistId == checklistId).MaxAsync(i => (int?)i.Position) ?? -1;
        var item = new ChecklistItem { ChecklistId = checklistId, Content = req.Content, Position = maxPos + 1 };
        _db.ChecklistItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new { item.Id, item.Content, item.IsCompleted, item.Position });
    }

    [HttpPut("checklist-items/{itemId}")]
    public async Task<IActionResult> UpdateItem(string workspaceSlug, Guid itemId, [FromBody] UpdateChecklistItemRequest req)
    {
        var item = await _db.ChecklistItems.FindAsync(itemId);
        if (item == null) return NotFound();
        if (req.IsCompleted.HasValue)
        {
            item.IsCompleted = req.IsCompleted.Value;
            item.CompletedAt = req.IsCompleted.Value ? DateTime.UtcNow : null;
        }
        if (req.Content != null) item.Content = req.Content;
        await _db.SaveChangesAsync();
        return Ok(new { item.Id, item.Content, item.IsCompleted, item.CompletedAt });
    }

    [HttpDelete("checklist-items/{itemId}")]
    public async Task<IActionResult> DeleteItem(string workspaceSlug, Guid itemId)
    {
        var item = await _db.ChecklistItems.FindAsync(itemId);
        if (item == null) return NotFound();
        _db.ChecklistItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("checklists/{checklistId}")]
    public async Task<IActionResult> DeleteChecklist(string workspaceSlug, Guid checklistId)
    {
        var checklist = await _db.TaskChecklists.Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == checklistId);
        if (checklist == null) return NotFound();
        _db.ChecklistItems.RemoveRange(checklist.Items);
        _db.TaskChecklists.Remove(checklist);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateChecklistRequest { public string Title { get; set; } = "Checklist"; }
public class AddChecklistItemRequest { public string Content { get; set; } = string.Empty; }
public class UpdateChecklistItemRequest { public bool? IsCompleted { get; set; } public string? Content { get; set; } }
