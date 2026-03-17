using Microsoft.AspNetCore.Authorization;
using Pulse.API.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Planner;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}")]
[Authorize]
[RequireWorkspaceMember]
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

        var startDate = DateTime.SpecifyKind(new DateTime(year, month, 1), DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1);

        // 1. Calendar events
        var events = await _db.CalendarEvents
            .Where(e => e.WorkspaceId == workspace.Id && e.StartTime >= startDate && e.StartTime < endDate)
            .OrderBy(e => e.StartTime)
            .Select(e => new UnifiedCalendarItem
            {
                Id = e.Id.ToString(), Title = e.Title, Description = e.Description,
                StartTime = e.StartTime, EndTime = e.EndTime, IsAllDay = e.IsAllDay,
                Type = "event", Color = "primary"
            })
            .ToListAsync();

        // 2. Task deadlines
        var deadlines = await _db.Tasks
            .Where(t => t.Project.WorkspaceId == workspace.Id && !t.IsDeleted
                && t.Deadline.HasValue && t.Deadline.Value >= startDate && t.Deadline.Value < endDate)
            .OrderBy(t => t.Deadline)
            .Select(t => new UnifiedCalendarItem
            {
                Id = t.Id.ToString(), Title = t.Title, Description = "Task deadline — " + t.Project.Name,
                StartTime = t.Deadline!.Value, EndTime = t.Deadline!.Value, IsAllDay = true,
                Type = "deadline", Color = "warning"
            })
            .ToListAsync();

        // 3. Meetings
        var meetings = await _db.Meetings
            .Where(m => m.WorkspaceId == workspace.Id
                && m.ProposedStartTime >= startDate && m.ProposedStartTime < endDate)
            .OrderBy(m => m.ProposedStartTime)
            .Select(m => new UnifiedCalendarItem
            {
                Id = m.Id.ToString(), Title = "🤝 " + m.Title, Description = m.Agenda,
                StartTime = m.ProposedStartTime, EndTime = m.ProposedEndTime, IsAllDay = false,
                Type = "meeting", Color = "success"
            })
            .ToListAsync();

        // 4. Planner blocks (user-scoped)
        var userId = _currentUser.UserId!.Value;
        var plannerBlocks = await _db.PlannerBlocks
            .Where(b => b.UserId == userId
                && b.StartTime >= startDate && b.StartTime < endDate)
            .OrderBy(b => b.StartTime)
            .Select(b => new UnifiedCalendarItem
            {
                Id = b.Id.ToString(), Title = "⏰ " + b.Title, Description = null,
                StartTime = b.StartTime, EndTime = b.EndTime, IsAllDay = false,
                Type = "planner", Color = "danger"
            })
            .ToListAsync();

        var items = events.Concat(deadlines).Concat(meetings).Concat(plannerBlocks)
            .OrderBy(i => i.StartTime).ToList();

        return Ok(items);
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
            StartTime = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc),
            EndTime = DateTime.SpecifyKind(request.EndTime, DateTimeKind.Utc),
            IsAllDay = request.IsAllDay,
            Location = request.Location,
        };

        _db.CalendarEvents.Add(calendarEvent);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvents), new { workspaceSlug, month = calendarEvent.StartTime.Month, year = calendarEvent.StartTime.Year }, new
        {
            calendarEvent.Id, calendarEvent.Title, calendarEvent.Description,
            calendarEvent.StartTime, calendarEvent.EndTime, calendarEvent.IsAllDay, calendarEvent.Location,
            Type = "event"
        });
    }
    [HttpDelete("calendar/{eventId}")]
    public async Task<IActionResult> DeleteEvent(string workspaceSlug, Guid eventId)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var evt = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == eventId && e.WorkspaceId == workspace.Id);
        if (evt == null) return NotFound();

        _db.CalendarEvents.Remove(evt);
        await _db.SaveChangesAsync();
        return NoContent();
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

public class UnifiedCalendarItem
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string Type { get; set; } = "event"; // event, deadline, meeting, planner
    public string Color { get; set; } = "primary"; // primary, success, warning, danger
}
