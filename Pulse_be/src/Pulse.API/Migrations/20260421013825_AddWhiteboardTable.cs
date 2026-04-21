using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.API.Migrations
{
    /// <inheritdoc />
    public partial class AddWhiteboardTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Whiteboards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DataJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Whiteboards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Whiteboards_Workspaces_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalTable: "Workspaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 141, DateTimeKind.Utc).AddTicks(9038), new DateTime(2026, 4, 21, 1, 38, 23, 141, DateTimeKind.Utc).AddTicks(9042) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(2958), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(2962) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(2978), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(2979) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3151), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3151) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3157), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3157) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3181), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3182) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3188), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3188) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3194), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3194) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3199), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3199) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3204), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3204) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3209), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3209) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3214), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3214) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3219), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3219) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3230), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3230) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3235), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3236) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3240), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3241) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3245), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3246) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3250), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3251) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3255), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3256) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3260), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3261) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3265), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3266) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3274), new DateTime(2026, 4, 21, 1, 38, 23, 142, DateTimeKind.Utc).AddTicks(3275) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(4675), new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(4702) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(7338), new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(7339) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(7373), new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(7374) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(7398), new DateTime(2026, 4, 21, 1, 38, 23, 140, DateTimeKind.Utc).AddTicks(7398) });

            migrationBuilder.CreateIndex(
                name: "IX_Whiteboards_WorkspaceId",
                table: "Whiteboards",
                column: "WorkspaceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Whiteboards");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(490), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(496) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3040), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3041) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3064), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3065) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3072), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3072) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3105), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3106) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3112), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3112) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3117), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3118) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0002-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3123), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3124) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3129), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3129) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3135), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3142) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3147), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3148) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3153), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3154) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000005"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3164), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3164) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0003-0001-0001-000000000006"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3170), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3170) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3175), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3176) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3259), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3260) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3267), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3267) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0004-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3272), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3273) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3278), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3278) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3284), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3285) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3295), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3295) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("f0000000-0005-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3300), new DateTime(2026, 3, 18, 20, 24, 26, 873, DateTimeKind.Utc).AddTicks(3301) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(698), new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(703) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(3073), new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(3076) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(3099), new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(3100) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(3106), new DateTime(2026, 3, 18, 20, 24, 26, 871, DateTimeKind.Utc).AddTicks(3106) });
        }
    }
}
