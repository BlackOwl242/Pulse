using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddChatAdminFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ChatChannels",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ChatChannels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "ChatChannelMembers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ChatChannels");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ChatChannels");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "ChatChannelMembers");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(7832), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(7834) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9004), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9005) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9011), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9012) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9017), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9017) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9041), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9041) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9046), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9047) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9051), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9052) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9056), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9057) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9061), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9062) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9066), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9067) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9071), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9072) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9077), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9077) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9180), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9181) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9187), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9187) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9192), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9192) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9197), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9198) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9202), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9203) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9207), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9208) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9212), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9212) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9217), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9217) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9225), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9226) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9230), new DateTime(2026, 3, 14, 3, 21, 25, 702, DateTimeKind.Utc).AddTicks(9231) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(5252), new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(5256) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(7332), new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(7334) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(7360), new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(7360) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(7367), new DateTime(2026, 3, 14, 3, 21, 25, 701, DateTimeKind.Utc).AddTicks(7368) });
        }
    }
}
