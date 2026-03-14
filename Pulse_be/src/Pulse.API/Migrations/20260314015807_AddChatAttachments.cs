using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddChatAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentName",
                table: "ChatMessages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentType",
                table: "ChatMessages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "ChatMessages",
                type: "text",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentName",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "AttachmentType",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "ChatMessages");

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
    }
}
