using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSelfDestruct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeleteAfterAt",
                table: "ChatMessages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SelfDestructSeconds",
                table: "ChatChannels",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(3733), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(3734) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4337), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4337) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4340), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4341) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4344), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4345) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4356), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4356) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4414), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4414) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4417), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4417) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4424), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4424) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4426), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4426) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4428), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4429) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4431), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4431) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4433), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4433) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4438), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4438) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4440), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4440) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4442), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4443) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4445), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4445) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4447), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4447) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4449), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4450) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4452), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4452) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4454), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4454) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4459), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4459) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4461), new DateTime(2026, 3, 14, 2, 53, 22, 946, DateTimeKind.Utc).AddTicks(4461) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(7215), new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(7217) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(8190), new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(8190) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(8197), new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(8197) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(8200), new DateTime(2026, 3, 14, 2, 53, 22, 945, DateTimeKind.Utc).AddTicks(8200) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeleteAfterAt",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "SelfDestructSeconds",
                table: "ChatChannels");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(6747), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(6747) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7353), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7354) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7357), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7357) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7359), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7360) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7362), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7362) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7364), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7364) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7373), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7374) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7376), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7376) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7378), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7379) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7381), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7381) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7431), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7431) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7433), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7434) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7436), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7436) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7438), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7438) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7444), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7444) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7446), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7446) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7448), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7448) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7450), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7451) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7453), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7453) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7455), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7455) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7457), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7458) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7460), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(7460) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(524), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(527) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(1395), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(1395) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(1411), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(1412) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(1415), new DateTime(2026, 3, 14, 1, 58, 6, 275, DateTimeKind.Utc).AddTicks(1415) });
        }
    }
}
