using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHiddenAtToChatMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "HiddenAt",
                table: "ChatChannelMembers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(9559), new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(9560) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(125), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(126) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(133), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(134) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(136), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(136) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(139), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(139) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(141), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(142) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(144), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(144) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(157), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(157) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(159), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(160) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(162), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(162) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(164), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(164) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(166), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(167) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(169), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(169) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(171), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(171) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(173), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(173) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(178), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(178) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(180), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(180) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(183), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(183) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(185), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(185) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(187), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(187) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(189), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(190) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(192), new DateTime(2026, 3, 12, 22, 13, 51, 856, DateTimeKind.Utc).AddTicks(192) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(3442), new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(3445) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(4203), new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(4204) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(4210), new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(4211) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(4227), new DateTime(2026, 3, 12, 22, 13, 51, 855, DateTimeKind.Utc).AddTicks(4227) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HiddenAt",
                table: "ChatChannelMembers");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(5523), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(5524) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6232), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6232) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6236), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6236) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6240), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6240) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6243), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6243) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6245), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6245) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6247), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6248) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6250), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6250) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6252), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6252) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6257), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6258) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6260), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6260) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6262), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6262) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6264), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6265) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6267), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6267) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6269), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6269) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6271), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6272) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6273), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6274) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6277), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6278) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6280), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6280) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6282), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6282) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6285), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6285) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6287), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(6287) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 231, DateTimeKind.Utc).AddTicks(9668), new DateTime(2026, 3, 12, 19, 24, 22, 231, DateTimeKind.Utc).AddTicks(9670) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(407), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(408) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(414), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(415) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(417), new DateTime(2026, 3, 12, 19, 24, 22, 232, DateTimeKind.Utc).AddTicks(418) });
        }
    }
}
