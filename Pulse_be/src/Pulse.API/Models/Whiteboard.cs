using System.ComponentModel.DataAnnotations;
using Pulse.API.Models.Entities.Organization;

namespace Pulse.API.Models;

public class Whiteboard
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid WorkspaceId { get; set; }

    public Workspace? Workspace { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string DataJson { get; set; } = "{}"; // Stores the tldraw snapshot

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
