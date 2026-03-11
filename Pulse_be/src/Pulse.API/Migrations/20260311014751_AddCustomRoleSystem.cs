using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomRoleSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSystem",
                table: "Roles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkspaceId",
                table: "Roles",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "Action", "CreatedAt", "Description", "Module", "Resource", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("f0000000-0001-0001-0001-000000000001"), "manage", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(940), "Full workspace management", "workspace", "workspace", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(941) },
                    { new Guid("f0000000-0001-0001-0001-000000000002"), "invite_member", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1507), "Invite members to workspace", "workspace", "workspace", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1507) },
                    { new Guid("f0000000-0001-0001-0001-000000000003"), "remove_member", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1510), "Remove members from workspace", "workspace", "workspace", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1511) },
                    { new Guid("f0000000-0002-0001-0001-000000000001"), "create", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1514), "Create projects", "project", "project", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1514) },
                    { new Guid("f0000000-0002-0001-0001-000000000002"), "view", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1525), "View projects", "project", "project", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1525) },
                    { new Guid("f0000000-0002-0001-0001-000000000003"), "edit", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1528), "Edit projects", "project", "project", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1529) },
                    { new Guid("f0000000-0002-0001-0001-000000000004"), "delete", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1594), "Delete projects", "project", "project", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1594) },
                    { new Guid("f0000000-0002-0001-0001-000000000005"), "manage_members", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1596), "Manage project members", "project", "project", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1596) },
                    { new Guid("f0000000-0003-0001-0001-000000000001"), "create", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1599), "Create tasks", "task", "task", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1599) },
                    { new Guid("f0000000-0003-0001-0001-000000000002"), "view", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1602), "View tasks", "task", "task", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1602) },
                    { new Guid("f0000000-0003-0001-0001-000000000003"), "edit", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1604), "Edit tasks", "task", "task", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1604) },
                    { new Guid("f0000000-0003-0001-0001-000000000004"), "delete", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1606), "Delete tasks", "task", "task", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1607) },
                    { new Guid("f0000000-0003-0001-0001-000000000005"), "assign", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1611), "Assign tasks to members", "task", "task", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1611) },
                    { new Guid("f0000000-0003-0001-0001-000000000006"), "change_status", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1613), "Change task status", "task", "task", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1614) },
                    { new Guid("f0000000-0004-0001-0001-000000000001"), "create", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1616), "Create teams", "team", "team", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1616) },
                    { new Guid("f0000000-0004-0001-0001-000000000002"), "view", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1618), "View teams", "team", "team", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1619) },
                    { new Guid("f0000000-0004-0001-0001-000000000003"), "edit", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1621), "Edit teams", "team", "team", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1621) },
                    { new Guid("f0000000-0004-0001-0001-000000000004"), "delete", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1623), "Delete teams", "team", "team", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1623) },
                    { new Guid("f0000000-0005-0001-0001-000000000001"), "create", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1626), "Create custom roles", "role", "role", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1626) },
                    { new Guid("f0000000-0005-0001-0001-000000000002"), "view", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1628), "View roles", "role", "role", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1628) },
                    { new Guid("f0000000-0005-0001-0001-000000000003"), "edit", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1632), "Edit roles", "role", "role", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1632) },
                    { new Guid("f0000000-0005-0001-0001-000000000004"), "delete", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1634), "Delete roles", "role", "role", new DateTime(2026, 3, 11, 1, 47, 50, 211, DateTimeKind.Utc).AddTicks(1635) }
                });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "IsSystem", "UpdatedAt", "WorkspaceId" },
                values: new object[] { new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(4789), true, new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(4793), null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "IsSystem", "UpdatedAt", "WorkspaceId" },
                values: new object[] { new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(5573), true, new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(5573), null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "IsSystem", "UpdatedAt", "WorkspaceId" },
                values: new object[] { new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(5579), true, new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(5580), null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "IsSystem", "UpdatedAt", "WorkspaceId" },
                values: new object[] { new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(5583), true, new DateTime(2026, 3, 11, 1, 47, 50, 210, DateTimeKind.Utc).AddTicks(5584), null });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { new Guid("f0000000-0001-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0001-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0001-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0002-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0002-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0002-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0002-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0003-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0003-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0003-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0003-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0003-0001-0001-000000000006"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0004-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0004-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0004-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0005-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0005-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0005-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") },
                    { new Guid("f0000000-0001-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0001-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0002-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0002-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0002-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0003-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0003-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0003-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0003-0001-0001-000000000006"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0004-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0004-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") },
                    { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0003-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0003-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0003-0001-0001-000000000006"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") },
                    { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") },
                    { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") },
                    { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") },
                    { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_WorkspaceId",
                table: "Roles",
                column: "WorkspaceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Workspaces_WorkspaceId",
                table: "Roles",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Workspaces_WorkspaceId",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_WorkspaceId",
                table: "Roles");

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0001-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0001-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0001-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000006"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000004"), new Guid("a1b2c3d4-0001-0001-0001-000000000001") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0001-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0001-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000005"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000006"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000002") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000001"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000003"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000006"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000003") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0002-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0003-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0004-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolePermissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { new Guid("f0000000-0005-0001-0001-000000000002"), new Guid("a1b2c3d4-0001-0001-0001-000000000004") });

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"));

            migrationBuilder.DeleteData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"));

            migrationBuilder.DropColumn(
                name: "IsSystem",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "Roles");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(2233), new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(2249) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(4636), new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(4637) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(4667), new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(4667) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(4673), new DateTime(2026, 3, 10, 1, 49, 13, 259, DateTimeKind.Utc).AddTicks(4674) });
        }
    }
}
