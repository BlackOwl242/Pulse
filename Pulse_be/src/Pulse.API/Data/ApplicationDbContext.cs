using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;
using Pulse.API.Models.Entities.TaskManagement;
using Pulse.API.Models.Entities.Planner;
using Pulse.API.Models.Entities.Communication;
using Pulse.API.Models.Entities.Strategy;
using Pulse.API.Models.Entities.AI;
using Pulse.API.Models.Entities.Analytics;

namespace Pulse.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings
                .Ignore(CoreEventId.PossibleIncorrectRequiredNavigationWithQueryFilterInteractionWarning)
                .Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    // Module 1: Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserWorkspaceRole> UserWorkspaceRoles => Set<UserWorkspaceRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    // Module 2: Organization
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Invitation> Invitations => Set<Invitation>();

    // Module 3: Task Management
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskFollower> TaskFollowers => Set<TaskFollower>();
    public DbSet<TaskLabel> TaskLabels => Set<TaskLabel>();
    public DbSet<TaskLabelAssignment> TaskLabelAssignments => Set<TaskLabelAssignment>();
    public DbSet<TaskChecklist> TaskChecklists => Set<TaskChecklist>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<TaskAttachment> TaskAttachments => Set<TaskAttachment>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<TaskDependency> TaskDependencies => Set<TaskDependency>();

    // Module 4: Planner
    public DbSet<PlannerBlock> PlannerBlocks => Set<PlannerBlock>();
    public DbSet<GoogleCalendarConnection> GoogleCalendarConnections => Set<GoogleCalendarConnection>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingParticipant> MeetingParticipants => Set<MeetingParticipant>();

    // Module 5: Communication
    public DbSet<ChatChannel> ChatChannels => Set<ChatChannel>();
    public DbSet<ChatChannelMember> ChatChannelMembers => Set<ChatChannelMember>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    // Module 6: Strategy
    public DbSet<Objective> Objectives => Set<Objective>();
    public DbSet<KeyResult> KeyResults => Set<KeyResult>();
    public DbSet<KeyResultTaskLink> KeyResultTaskLinks => Set<KeyResultTaskLink>();
    public DbSet<OKRCheckIn> OKRCheckIns => Set<OKRCheckIn>();

    // Module 7: AI
    public DbSet<AIConversation> AIConversations => Set<AIConversation>();
    public DbSet<AIMessage> AIMessages => Set<AIMessage>();
    public DbSet<AIActionLog> AIActionLogs => Set<AIActionLog>();

    // Module 8: Analytics
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();
    public DbSet<AnalyticsSnapshot> AnalyticsSnapshots => Set<AnalyticsSnapshot>();
    public DbSet<WorkloadSummary> WorkloadSummaries => Set<WorkloadSummary>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== Module 1: Identity =====
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.FirstName).HasMaxLength(100);
            e.Property(u => u.LastName).HasMaxLength(100);
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
            e.Property(r => r.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.HasKey(rp => new { rp.RoleId, rp.PermissionId });
            e.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
            e.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
        });

        modelBuilder.Entity<UserWorkspaceRole>(e =>
        {
            e.HasIndex(uwr => new { uwr.UserId, uwr.WorkspaceId, uwr.RoleId }).IsUnique();
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(rt => rt.Token).IsUnique();
        });

        modelBuilder.Entity<PasswordResetToken>(e =>
        {
            e.HasIndex(prt => prt.Token).IsUnique();
        });

        // ===== Module 2: Organization =====
        modelBuilder.Entity<Workspace>(e =>
        {
            e.HasIndex(w => w.Slug).IsUnique();
            e.Property(w => w.Slug).HasMaxLength(100);
            e.Property(w => w.Name).HasMaxLength(200);
            e.HasQueryFilter(w => !w.IsDeleted);
        });

        modelBuilder.Entity<Team>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<TeamMember>(e =>
        {
            e.HasIndex(tm => new { tm.TeamId, tm.UserId }).IsUnique();
        });

        modelBuilder.Entity<UserProfile>(e =>
        {
            e.HasIndex(up => up.UserId).IsUnique();
            e.Property(up => up.Skills).HasColumnType("jsonb");
            e.Property(up => up.SocialLinks).HasColumnType("jsonb");
        });

        modelBuilder.Entity<Invitation>(e =>
        {
            e.HasIndex(i => i.Token).IsUnique();
            e.Property(i => i.Email).HasMaxLength(256);
        });

        // ===== Module 3: Task Management =====
        modelBuilder.Entity<Project>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(200);
            e.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<TaskItem>(e =>
        {
            e.Property(t => t.Title).HasMaxLength(500);
            e.HasQueryFilter(t => !t.IsDeleted);
            e.HasOne(t => t.ParentTask)
                .WithMany(t => t.Subtasks)
                .HasForeignKey(t => t.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskFollower>(e =>
        {
            e.HasKey(tf => new { tf.TaskId, tf.UserId });
        });

        modelBuilder.Entity<TaskLabelAssignment>(e =>
        {
            e.HasKey(tla => new { tla.TaskId, tla.LabelId });
        });

        modelBuilder.Entity<TaskComment>(e =>
        {
            e.HasOne(tc => tc.ParentComment)
                .WithMany(tc => tc.Replies)
                .HasForeignKey(tc => tc.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskDependency>(e =>
        {
            e.HasOne(td => td.Task)
                .WithMany(t => t.Dependencies)
                .HasForeignKey(td => td.TaskId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(td => td.DependsOnTask)
                .WithMany(t => t.Dependents)
                .HasForeignKey(td => td.DependsOnTaskId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== Module 4: Planner =====
        modelBuilder.Entity<CalendarEvent>(e =>
        {
            e.Property(ce => ce.Attendees).HasColumnType("jsonb");
        });

        // ===== Module 5: Communication =====
        modelBuilder.Entity<ChatChannelMember>(e =>
        {
            e.HasKey(cm => new { cm.ChannelId, cm.UserId });
        });

        modelBuilder.Entity<ChatMessage>(e =>
        {
            e.HasQueryFilter(m => !m.IsDeleted);
            e.HasOne(m => m.ReplyTo)
                .WithMany()
                .HasForeignKey(m => m.ReplyToId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== Module 6: Strategy =====
        modelBuilder.Entity<Objective>(e =>
        {
            e.HasOne(o => o.ParentObjective)
                .WithMany(o => o.ChildObjectives)
                .HasForeignKey(o => o.ParentObjectiveId)
                .OnDelete(DeleteBehavior.Restrict);
            e.Property(o => o.Progress).HasPrecision(5, 2);
        });

        modelBuilder.Entity<KeyResult>(e =>
        {
            e.Property(kr => kr.StartValue).HasPrecision(18, 4);
            e.Property(kr => kr.TargetValue).HasPrecision(18, 4);
            e.Property(kr => kr.CurrentValue).HasPrecision(18, 4);
            e.Property(kr => kr.Progress).HasPrecision(5, 2);
        });

        modelBuilder.Entity<OKRCheckIn>(e =>
        {
            e.Property(c => c.PreviousValue).HasPrecision(18, 4);
            e.Property(c => c.NewValue).HasPrecision(18, 4);
        });

        // ===== Module 8: Analytics =====
        modelBuilder.Entity<WorkloadSummary>(e =>
        {
            e.Property(ws => ws.CompletionRate).HasPrecision(5, 2);
        });

        // Seed default roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001"), Name = "Admin", Description = "Full system access" },
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000002"), Name = "Manager", Description = "Team and project management" },
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000003"), Name = "Staff", Description = "Standard workspace member" },
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000004"), Name = "Guest", Description = "Limited read access" }
        );
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Models.Common.BaseEntity &&
                        (e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            ((Models.Common.BaseEntity)entry.Entity).UpdatedAt = DateTime.UtcNow;
        }
    }
}
