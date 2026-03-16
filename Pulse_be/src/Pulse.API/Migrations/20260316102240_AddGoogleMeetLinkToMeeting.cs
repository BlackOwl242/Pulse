using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleMeetLinkToMeeting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleMeetLink",
                table: "Meetings",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7012), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7014) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7633), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7633) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7638), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7638) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7641), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7641) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7643), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7644) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7646), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7646) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7714), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7714) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7717), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7717) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7719), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7720) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7722), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7722) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7724), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7724) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7726), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7727) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7729), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7729) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7731), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7731) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7735), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7736) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7738), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7738) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7740), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7740) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7742), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7742) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7744), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7745) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7747), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7747) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7749), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7749) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7751), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(7751) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(340), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(345) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(1198), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(1199) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(1223), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(1223) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(1225), new DateTime(2026, 3, 16, 10, 22, 39, 269, DateTimeKind.Utc).AddTicks(1226) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleMeetLink",
                table: "Meetings");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(465), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(466) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1051), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1051) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1120), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1121) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1123), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1123) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1125), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1126) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1128), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1129) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1131), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1131) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1155), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1155) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1157), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1157) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1159), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1160) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1165), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1166) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1169), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1169) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1171), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1172) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1174), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1174) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1176), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1176) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1178), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1178) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1180), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1181) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1183), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1183) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1187), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1187) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1189), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1189) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1191), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1192) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1194), new DateTime(2026, 3, 14, 11, 18, 57, 689, DateTimeKind.Utc).AddTicks(1194) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(4419), new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(4421) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(5164), new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(5165) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(5171), new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(5172) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(5175), new DateTime(2026, 3, 14, 11, 18, 57, 688, DateTimeKind.Utc).AddTicks(5175) });
        }
    }
}
