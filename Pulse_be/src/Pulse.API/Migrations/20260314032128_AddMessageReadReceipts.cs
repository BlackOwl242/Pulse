using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageReadReceipts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MessageReadReceipts",
                columns: table => new
                {
                    MessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageReadReceipts", x => new { x.MessageId, x.UserId });
                    table.ForeignKey(
                        name: "FK_MessageReadReceipts_ChatMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "ChatMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MessageReadReceipts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_MessageReadReceipts_UserId",
                table: "MessageReadReceipts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageReadReceipts");

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
    }
}
