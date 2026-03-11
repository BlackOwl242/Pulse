using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Analytics;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AnalyticsController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet("workload")]
    public async Task<IActionResult> GetWorkload(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var summaries = await _db.WorkloadSummaries
            .Where(w => w.WorkspaceId == workspace.Id)
            .OrderByDescending(w => w.PeriodDate)
            .Take(30)
            .Select(w => new
            {
                w.UserId, w.PeriodDate, w.TotalTasks, w.CompletedTasks, w.OverdueTasks,
                w.TotalMinutesTracked, w.EstimatedMinutesRemaining, w.CompletionRate,
                User = new { w.User.Id, w.User.FirstName, w.User.LastName }
            })
            .ToListAsync();
        return Ok(summaries);
    }

    [HttpGet("widgets")]
    public async Task<IActionResult> GetWidgets(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var widgets = await _db.DashboardWidgets
            .Where(w => w.UserId == userId && w.WorkspaceId == workspace.Id)
            .OrderBy(w => w.PositionY).ThenBy(w => w.PositionX)
            .Select(w => new { w.Id, w.WidgetType, w.Config, w.PositionX, w.PositionY, w.Width, w.Height })
            .ToListAsync();
        return Ok(widgets);
    }

    [HttpPost("widgets")]
    public async Task<IActionResult> AddWidget(string workspaceSlug, [FromBody] AddWidgetRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var widget = new DashboardWidget
        {
            UserId = userId,
            WorkspaceId = workspace.Id,
            WidgetType = req.WidgetType,
            Config = req.Config,
            PositionX = req.PositionX,
            PositionY = req.PositionY,
            Width = req.Width,
            Height = req.Height
        };
        _db.DashboardWidgets.Add(widget);
        await _db.SaveChangesAsync();
        return Ok(new { widget.Id, widget.WidgetType, widget.PositionX, widget.PositionY, widget.Width, widget.Height });
    }

    [HttpDelete("widgets/{widgetId}")]
    public async Task<IActionResult> RemoveWidget(string workspaceSlug, Guid widgetId)
    {
        var widget = await _db.DashboardWidgets.FindAsync(widgetId);
        if (widget == null) return NotFound();
        _db.DashboardWidgets.Remove(widget);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var projects = await _db.Projects.CountAsync(p => p.Workspace.Slug == workspaceSlug && !p.IsDeleted);
        var tasks = await _db.Tasks.CountAsync(t => t.Project.Workspace.Slug == workspaceSlug && !t.IsDeleted);
        var completedTasks = await _db.Tasks.CountAsync(t => t.Project.Workspace.Slug == workspaceSlug && !t.IsDeleted && t.Status == TaskItemStatus.Done);
        var overdueTasks = await _db.Tasks.CountAsync(t => t.Project.Workspace.Slug == workspaceSlug && !t.IsDeleted && t.Deadline < DateTime.UtcNow && t.Status != TaskItemStatus.Done);
        var members = await _db.UserWorkspaceRoles.CountAsync(m => m.Workspace.Slug == workspaceSlug);
        var totalTimeMinutes = await _db.TimeEntries.Where(t => t.WorkspaceId == workspace.Id).SumAsync(t => t.DurationMinutes ?? 0);

        return Ok(new
        {
            projects, tasks, completedTasks, overdueTasks, members, totalTimeMinutes,
            completionRate = tasks > 0 ? Math.Round((double)completedTasks / tasks * 100, 1) : 0
        });
    }
}

public class AddWidgetRequest
{
    public DashboardWidgetType WidgetType { get; set; }
    public string? Config { get; set; }
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public int Width { get; set; } = 4;
    public int Height { get; set; } = 3;
}
