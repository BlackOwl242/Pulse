using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Planner;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CalendarController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("calendar")]
    public async Task<IActionResult> GetEvents(string workspaceSlug, [FromQuery] int month, [FromQuery] int year)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        // Get calendar events
        var events = await _db.CalendarEvents
            .Where(e => e.WorkspaceId == workspace.Id && e.StartTime >= startDate && e.StartTime < endDate)
            .OrderBy(e => e.StartTime)
            .Select(e => new
            {
                e.Id, e.Title, e.Description, e.StartTime, e.EndTime, e.IsAllDay, e.Location,
                Type = "event"
            })
            .ToListAsync();

        // Get task deadlines in this month
        var deadlines = await _db.Tasks
            .Where(t => t.Project.WorkspaceId == workspace.Id && !t.IsDeleted
                && t.Deadline.HasValue && t.Deadline.Value >= startDate && t.Deadline.Value < endDate)
            .OrderBy(t => t.Deadline)
            .Select(t => new
            {
                t.Id, Title = t.Title, Description = (string?)null,
                StartTime = t.Deadline!.Value, EndTime = t.Deadline!.Value,
                IsAllDay = true, Location = (string?)null,
                Type = "deadline"
            })
            .ToListAsync();

        return Ok(new { events, deadlines });
    }

    [HttpPost("calendar")]
    public async Task<IActionResult> CreateEvent(string workspaceSlug, [FromBody] CreateCalendarEventRequest request)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var calendarEvent = new CalendarEvent
        {
            UserId = _currentUser.UserId!.Value,
            WorkspaceId = workspace.Id,
            Title = request.Title,
            Description = request.Description,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsAllDay = request.IsAllDay,
            Location = request.Location,
        };

        _db.CalendarEvents.Add(calendarEvent);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvents), new { workspaceSlug, month = calendarEvent.StartTime.Month, year = calendarEvent.StartTime.Year }, calendarEvent);
    }
}

public class CreateCalendarEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string? Location { get; set; }
}
