using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Data;
using Pulse.API.Models.Entities.Planner;
using Pulse.API.Models.Enums;
using Pulse.API.Services.Interfaces;

namespace Pulse.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/meetings")]
[Authorize]
public class MeetingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MeetingsController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(string workspaceSlug)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var meetings = await _db.Meetings
            .Where(m => m.WorkspaceId == workspace.Id)
            .OrderByDescending(m => m.ProposedStartTime)
            .Select(m => new
            {
                m.Id, m.Title, m.Description, m.Agenda, m.ProposedStartTime, m.ProposedEndTime, m.Status,
                Organizer = new { m.Organizer.Id, m.Organizer.FirstName, m.Organizer.LastName },
                Participants = m.Participants.Select(p => new
                {
                    p.UserId, p.ResponseStatus,
                    User = new { p.User.Id, p.User.FirstName, p.User.LastName, p.User.AvatarUrl }
                }).ToList()
            })
            .ToListAsync();
        return Ok(meetings);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string workspaceSlug, [FromBody] CreateMeetingRequest req)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug);
        if (workspace == null) return NotFound();

        var userId = _currentUser.UserId!.Value;
        var meeting = new Meeting
        {
            WorkspaceId = workspace.Id,
            OrganizerId = userId,
            Title = req.Title,
            Description = req.Description,
            Agenda = req.Agenda,
            ProposedStartTime = req.StartTime,
            ProposedEndTime = req.EndTime,
            Status = MeetingStatus.Proposed
        };
        _db.Meetings.Add(meeting);

        // Add organizer as participant
        _db.MeetingParticipants.Add(new MeetingParticipant { MeetingId = meeting.Id, UserId = userId, ResponseStatus = ResponseStatus.Accepted });

        // Add invited participants
        foreach (var pid in req.ParticipantIds ?? new List<Guid>())
        {
            if (pid != userId)
                _db.MeetingParticipants.Add(new MeetingParticipant { MeetingId = meeting.Id, UserId = pid });
        }

        await _db.SaveChangesAsync();
        return Ok(new { meeting.Id, meeting.Title, meeting.ProposedStartTime, meeting.Status });
    }

    [HttpPut("{meetingId}/respond")]
    public async Task<IActionResult> Respond(string workspaceSlug, Guid meetingId, [FromBody] RespondMeetingRequest req)
    {
        var userId = _currentUser.UserId!.Value;
        var participant = await _db.MeetingParticipants.FirstOrDefaultAsync(p => p.MeetingId == meetingId && p.UserId == userId);
        if (participant == null) return NotFound();

        participant.ResponseStatus = req.Response;
        participant.RespondedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{meetingId}")]
    public async Task<IActionResult> Cancel(string workspaceSlug, Guid meetingId)
    {
        var meeting = await _db.Meetings.FindAsync(meetingId);
        if (meeting == null) return NotFound();
        meeting.Status = MeetingStatus.Cancelled;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateMeetingRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Agenda { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<Guid>? ParticipantIds { get; set; }
}

public class RespondMeetingRequest
{
    public ResponseStatus Response { get; set; }
}
