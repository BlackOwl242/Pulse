using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Pulse.API.Models.Entities.Identity;
using Pulse.API.Models.Entities.Organization;
using Pulse.API.Models.Enums;
using Pulse.API.Models.Entities.TaskManagement;

namespace Pulse.API.Data;

public static class DbSeeder
{
    public static async Task SeedSampleDataAsync(ApplicationDbContext db)
    {
        // Skip if users already exist
        if (await db.Users.AnyAsync()) return;

        // ===== Role IDs (matching HasData seed) =====
        var adminRoleId = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001");
        var managerRoleId = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000002");
        var staffRoleId = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000003");
        var guestRoleId = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000004");

        // ===== Create sample users (password: "Pulse@123") =====
        var password = HashPassword("Pulse@123");

        var adminUser = new User
        {
            Id = Guid.Parse("b1000000-0000-0000-0000-000000000001"),
            Email = "admin@pulse.dev",
            PasswordHash = password,
            FirstName = "Admin",
            LastName = "Pulse",
            Provider = AuthProvider.Local,
            EmailConfirmed = true,
            IsActive = true,
        };

        var managerUser = new User
        {
            Id = Guid.Parse("b1000000-0000-0000-0000-000000000002"),
            Email = "manager@pulse.dev",
            PasswordHash = password,
            FirstName = "Manager",
            LastName = "Pulse",
            Provider = AuthProvider.Local,
            EmailConfirmed = true,
            IsActive = true,
        };

        var staffUser = new User
        {
            Id = Guid.Parse("b1000000-0000-0000-0000-000000000003"),
            Email = "staff@pulse.dev",
            PasswordHash = password,
            FirstName = "Staff",
            LastName = "Pulse",
            Provider = AuthProvider.Local,
            EmailConfirmed = true,
            IsActive = true,
        };

        var guestUser = new User
        {
            Id = Guid.Parse("b1000000-0000-0000-0000-000000000004"),
            Email = "guest@pulse.dev",
            PasswordHash = password,
            FirstName = "Guest",
            LastName = "Viewer",
            Provider = AuthProvider.Local,
            EmailConfirmed = true,
            IsActive = true,
        };

        db.Users.AddRange(adminUser, managerUser, staffUser, guestUser);

        // ===== Create user profiles =====
        db.UserProfiles.AddRange(
            new UserProfile { UserId = adminUser.Id, JobTitle = "System Administrator" },
            new UserProfile { UserId = managerUser.Id, JobTitle = "Project Manager" },
            new UserProfile { UserId = staffUser.Id, JobTitle = "Developer" },
            new UserProfile { UserId = guestUser.Id, JobTitle = "External Reviewer" }
        );

        // ===== Create demo workspace =====
        var workspace = new Workspace
        {
            Id = Guid.Parse("c1000000-0000-0000-0000-000000000001"),
            Name = "Pulse Demo",
            Slug = "pulse-demo",
            Description = "Workspace mẫu để test các tính năng",
            OwnerId = adminUser.Id,
            CreatedById = adminUser.Id,
            Plan = WorkspacePlan.Pro,
        };
        db.Workspaces.Add(workspace);

        // ===== Assign roles to users in workspace =====
        db.UserWorkspaceRoles.AddRange(
            new UserWorkspaceRole { UserId = adminUser.Id, WorkspaceId = workspace.Id, RoleId = adminRoleId },
            new UserWorkspaceRole { UserId = managerUser.Id, WorkspaceId = workspace.Id, RoleId = managerRoleId },
            new UserWorkspaceRole { UserId = staffUser.Id, WorkspaceId = workspace.Id, RoleId = staffRoleId },
            new UserWorkspaceRole { UserId = guestUser.Id, WorkspaceId = workspace.Id, RoleId = guestRoleId }
        );

        // ===== Create demo project =====
        var project = new Models.Entities.TaskManagement.Project
        {
            Id = Guid.Parse("d1000000-0000-0000-0000-000000000001"),
            WorkspaceId = workspace.Id,
            Name = "MVP Development",
            Description = "Phát triển các tính năng MVP cho Pulse",
            Color = "#6366f1",
            Icon = "🚀",
            CreatedById = adminUser.Id,
        };
        db.Projects.Add(project);

        // ===== Create sample tasks =====
        db.Tasks.AddRange(
            new Models.Entities.TaskManagement.TaskItem
            {
                ProjectId = project.Id,
                Title = "Setup authentication flow",
                Description = "Implement login, register, forgot password",
                Status = TaskItemStatus.Done,
                Priority = TaskPriority.High,
                Assignees = new List<TaskAssignee> { new TaskAssignee { UserId = staffUser.Id } },
                CreatedById = managerUser.Id,
                Position = 0,
                CompletedAt = DateTime.UtcNow.AddDays(-1),
            },
            new Models.Entities.TaskManagement.TaskItem
            {
                ProjectId = project.Id,
                Title = "Design workspace dashboard",
                Description = "Create the main dashboard UI with widgets",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.High,
                Assignees = new List<TaskAssignee> { new TaskAssignee { UserId = staffUser.Id } },
                CreatedById = managerUser.Id,
                Position = 0,
            },
            new Models.Entities.TaskManagement.TaskItem
            {
                ProjectId = project.Id,
                Title = "Implement task board (Kanban)",
                Description = "Drag & drop task cards between columns",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.Medium,
                Assignees = new List<TaskAssignee> { new TaskAssignee { UserId = staffUser.Id } },
                CreatedById = managerUser.Id,
                Position = 1,
            },
            new Models.Entities.TaskManagement.TaskItem
            {
                ProjectId = project.Id,
                Title = "Setup notification system",
                Description = "Real-time notifications via SignalR",
                Status = TaskItemStatus.Todo,
                Priority = TaskPriority.Medium,
                CreatedById = managerUser.Id,
                Position = 0,
            },
            new Models.Entities.TaskManagement.TaskItem
            {
                ProjectId = project.Id,
                Title = "Integrate Google Calendar",
                Description = "Sync events with Google Calendar API",
                Status = TaskItemStatus.Todo,
                Priority = TaskPriority.Low,
                CreatedById = adminUser.Id,
                Position = 1,
            }
        );

        await db.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        var salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
            rng.GetBytes(salt);

        var hash = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
        var hashBytes = hash.GetBytes(32);

        var combined = new byte[48];
        Array.Copy(salt, 0, combined, 0, 16);
        Array.Copy(hashBytes, 0, combined, 16, 32);

        return Convert.ToBase64String(combined);
    }
}
