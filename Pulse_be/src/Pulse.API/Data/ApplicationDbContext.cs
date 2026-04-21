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
    public DbSet<TaskAssignee> TaskAssignees => Set<TaskAssignee>();
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
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingParticipant> MeetingParticipants => Set<MeetingParticipant>();
    public DbSet<Pulse.API.Models.Whiteboard> Whiteboards => Set<Pulse.API.Models.Whiteboard>();

    // Module 5: Communication
    public DbSet<ChatChannel> ChatChannels => Set<ChatChannel>();
    public DbSet<ChatChannelMember> ChatChannelMembers => Set<ChatChannelMember>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<MessageReadReceipt> MessageReadReceipts => Set<MessageReadReceipt>();
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

        modelBuilder.Entity<TaskAssignee>(e =>
        {
            e.HasKey(ta => new { ta.TaskId, ta.UserId });
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

        modelBuilder.Entity<MessageReadReceipt>(e =>
        {
            e.HasKey(r => new { r.MessageId, r.UserId });
            e.HasOne(r => r.Message)
                .WithMany(m => m.ReadReceipts)
                .HasForeignKey(r => r.MessageId);
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
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001"), Name = "Admin", Description = "Full system access", IsSystem = true },
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000002"), Name = "Manager", Description = "Team and project management", IsSystem = true },
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000003"), Name = "Staff", Description = "Standard workspace member", IsSystem = true },
            new Role { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000004"), Name = "Guest", Description = "Limited read access", IsSystem = true }
        );

        // Seed permissions
        modelBuilder.Entity<Permission>().HasData(
            // Workspace
            new Permission { Id = Guid.Parse("f0000000-0001-0001-0001-000000000001"), Module = "workspace", Action = "manage", Resource = "workspace", Description = "Full workspace management" },
            new Permission { Id = Guid.Parse("f0000000-0001-0001-0001-000000000002"), Module = "workspace", Action = "invite_member", Resource = "workspace", Description = "Invite members to workspace" },
            new Permission { Id = Guid.Parse("f0000000-0001-0001-0001-000000000003"), Module = "workspace", Action = "remove_member", Resource = "workspace", Description = "Remove members from workspace" },
            // Project
            new Permission { Id = Guid.Parse("f0000000-0002-0001-0001-000000000001"), Module = "project", Action = "create", Resource = "project", Description = "Create projects" },
            new Permission { Id = Guid.Parse("f0000000-0002-0001-0001-000000000002"), Module = "project", Action = "view", Resource = "project", Description = "View projects" },
            new Permission { Id = Guid.Parse("f0000000-0002-0001-0001-000000000003"), Module = "project", Action = "edit", Resource = "project", Description = "Edit projects" },
            new Permission { Id = Guid.Parse("f0000000-0002-0001-0001-000000000004"), Module = "project", Action = "delete", Resource = "project", Description = "Delete projects" },
            new Permission { Id = Guid.Parse("f0000000-0002-0001-0001-000000000005"), Module = "project", Action = "manage_members", Resource = "project", Description = "Manage project members" },
            // Task
            new Permission { Id = Guid.Parse("f0000000-0003-0001-0001-000000000001"), Module = "task", Action = "create", Resource = "task", Description = "Create tasks" },
            new Permission { Id = Guid.Parse("f0000000-0003-0001-0001-000000000002"), Module = "task", Action = "view", Resource = "task", Description = "View tasks" },
            new Permission { Id = Guid.Parse("f0000000-0003-0001-0001-000000000003"), Module = "task", Action = "edit", Resource = "task", Description = "Edit tasks" },
            new Permission { Id = Guid.Parse("f0000000-0003-0001-0001-000000000004"), Module = "task", Action = "delete", Resource = "task", Description = "Delete tasks" },
            new Permission { Id = Guid.Parse("f0000000-0003-0001-0001-000000000005"), Module = "task", Action = "assign", Resource = "task", Description = "Assign tasks to members" },
            new Permission { Id = Guid.Parse("f0000000-0003-0001-0001-000000000006"), Module = "task", Action = "change_status", Resource = "task", Description = "Change task status" },
            // Team
            new Permission { Id = Guid.Parse("f0000000-0004-0001-0001-000000000001"), Module = "team", Action = "create", Resource = "team", Description = "Create teams" },
            new Permission { Id = Guid.Parse("f0000000-0004-0001-0001-000000000002"), Module = "team", Action = "view", Resource = "team", Description = "View teams" },
            new Permission { Id = Guid.Parse("f0000000-0004-0001-0001-000000000003"), Module = "team", Action = "edit", Resource = "team", Description = "Edit teams" },
            new Permission { Id = Guid.Parse("f0000000-0004-0001-0001-000000000004"), Module = "team", Action = "delete", Resource = "team", Description = "Delete teams" },
            // Role
            new Permission { Id = Guid.Parse("f0000000-0005-0001-0001-000000000001"), Module = "role", Action = "create", Resource = "role", Description = "Create custom roles" },
            new Permission { Id = Guid.Parse("f0000000-0005-0001-0001-000000000002"), Module = "role", Action = "view", Resource = "role", Description = "View roles" },
            new Permission { Id = Guid.Parse("f0000000-0005-0001-0001-000000000003"), Module = "role", Action = "edit", Resource = "role", Description = "Edit roles" },
            new Permission { Id = Guid.Parse("f0000000-0005-0001-0001-000000000004"), Module = "role", Action = "delete", Resource = "role", Description = "Delete roles" }
        );

        // Seed RolePermissions — Admin gets ALL permissions
        var allPermissionIds = new[]
        {
            "f0000000-0001-0001-0001-000000000001", "f0000000-0001-0001-0001-000000000002", "f0000000-0001-0001-0001-000000000003",
            "f0000000-0002-0001-0001-000000000001", "f0000000-0002-0001-0001-000000000002", "f0000000-0002-0001-0001-000000000003",
            "f0000000-0002-0001-0001-000000000004", "f0000000-0002-0001-0001-000000000005",
            "f0000000-0003-0001-0001-000000000001", "f0000000-0003-0001-0001-000000000002", "f0000000-0003-0001-0001-000000000003",
            "f0000000-0003-0001-0001-000000000004", "f0000000-0003-0001-0001-000000000005", "f0000000-0003-0001-0001-000000000006",
            "f0000000-0004-0001-0001-000000000001", "f0000000-0004-0001-0001-000000000002", "f0000000-0004-0001-0001-000000000003",
            "f0000000-0004-0001-0001-000000000004",
            "f0000000-0005-0001-0001-000000000001", "f0000000-0005-0001-0001-000000000002", "f0000000-0005-0001-0001-000000000003",
            "f0000000-0005-0001-0001-000000000004",
        };

        var adminRoleId = "a1b2c3d4-0001-0001-0001-000000000001";
        var managerRoleId = "a1b2c3d4-0001-0001-0001-000000000002";
        var staffRoleId = "a1b2c3d4-0001-0001-0001-000000000003";
        var guestRoleId = "a1b2c3d4-0001-0001-0001-000000000004";

        // Manager: no workspace.manage, no *.delete, no role.create/edit/delete
        var managerPermissions = new[]
        {
            "f0000000-0001-0001-0001-000000000002", "f0000000-0001-0001-0001-000000000003", // invite, remove
            "f0000000-0002-0001-0001-000000000001", "f0000000-0002-0001-0001-000000000002", "f0000000-0002-0001-0001-000000000003", "f0000000-0002-0001-0001-000000000005", // project CRUD (no delete)
            "f0000000-0003-0001-0001-000000000001", "f0000000-0003-0001-0001-000000000002", "f0000000-0003-0001-0001-000000000003", "f0000000-0003-0001-0001-000000000005", "f0000000-0003-0001-0001-000000000006", // task (no delete)
            "f0000000-0004-0001-0001-000000000001", "f0000000-0004-0001-0001-000000000002", "f0000000-0004-0001-0001-000000000003", // team (no delete)
            "f0000000-0005-0001-0001-000000000002", // role view
        };

        // Staff: create/view/edit tasks, view projects/teams/roles
        var staffPermissions = new[]
        {
            "f0000000-0002-0001-0001-000000000002", // project.view
            "f0000000-0003-0001-0001-000000000001", "f0000000-0003-0001-0001-000000000002", "f0000000-0003-0001-0001-000000000003", "f0000000-0003-0001-0001-000000000006", // task create/view/edit/change_status
            "f0000000-0004-0001-0001-000000000002", // team.view
            "f0000000-0005-0001-0001-000000000002", // role.view
        };

        // Guest: view only
        var guestPermissions = new[]
        {
            "f0000000-0002-0001-0001-000000000002", // project.view
            "f0000000-0003-0001-0001-000000000002", // task.view
            "f0000000-0004-0001-0001-000000000002", // team.view
            "f0000000-0005-0001-0001-000000000002", // role.view
        };

        var rolePermissionSeed = new List<object>();
        foreach (var pid in allPermissionIds)
            rolePermissionSeed.Add(new { RoleId = Guid.Parse(adminRoleId), PermissionId = Guid.Parse(pid) });
        foreach (var pid in managerPermissions)
            rolePermissionSeed.Add(new { RoleId = Guid.Parse(managerRoleId), PermissionId = Guid.Parse(pid) });
        foreach (var pid in staffPermissions)
            rolePermissionSeed.Add(new { RoleId = Guid.Parse(staffRoleId), PermissionId = Guid.Parse(pid) });
        foreach (var pid in guestPermissions)
            rolePermissionSeed.Add(new { RoleId = Guid.Parse(guestRoleId), PermissionId = Guid.Parse(pid) });

        modelBuilder.Entity<RolePermission>().HasData(rolePermissionSeed.ToArray());
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
