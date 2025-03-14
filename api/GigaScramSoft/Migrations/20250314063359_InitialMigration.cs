using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GigaScramSoft.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContentUnitMainCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentUnitMainCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContentUnitSubCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MainCategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentUnitSubCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContentUnitSubCategories_ContentUnitMainCategories_MainCategoryId",
                        column: x => x.MainCategoryId,
                        principalTable: "ContentUnitMainCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Login = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContentUnits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Header = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FullDescription = table.Column<string>(type: "nvarchar(1500)", maxLength: 1500, nullable: false),
                    PreviewImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DownloadLink = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubCategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContentUnits_ContentUnitSubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "ContentUnitSubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContentUnitImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentUnitId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentUnitImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContentUnitImages_ContentUnits_ContentUnitId",
                        column: x => x.ContentUnitId,
                        principalTable: "ContentUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ContentUnitMainCategories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Operating Systems" },
                    { 2, "Development & Programming" },
                    { 3, "Security & Privacy" },
                    { 4, "Multimedia & Design" },
                    { 5, "Productivity & Office Tools" },
                    { 6, "Networking & Internet" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Admin" },
                    { 2, "User" },
                    { 3, "Guest" }
                });

            migrationBuilder.InsertData(
                table: "ContentUnitSubCategories",
                columns: new[] { "Id", "MainCategoryId", "Name" },
                values: new object[,]
                {
                    { 1, 1, "Windows Software" },
                    { 2, 1, "MacOS Software" },
                    { 3, 1, "Linux Software" },
                    { 4, 1, "Mobile Apps (Android, iOS)" },
                    { 5, 2, "IDE & Code Editors" },
                    { 6, 2, "Frameworks & Libraries" },
                    { 7, 2, "Database Management" },
                    { 8, 2, "Version Control & DevOps" },
                    { 9, 3, "Antivirus & Anti-Malware" },
                    { 10, 3, "VPN & Proxy Software" },
                    { 11, 3, "Password Managers" },
                    { 12, 3, "Encryption Tools" },
                    { 13, 4, "Photo & Image Editing" },
                    { 14, 4, "Video Editing & Production" },
                    { 15, 4, "Audio Editing & Music Production" },
                    { 16, 4, "3D Modeling & Animation" },
                    { 17, 5, "Office Suites" },
                    { 18, 5, "Project Management" },
                    { 19, 5, "Note-Taking & Mind Mapping" },
                    { 20, 5, "PDF Tools" },
                    { 21, 6, "Browsers & Extensions" },
                    { 22, 6, "Download Managers" },
                    { 23, 6, "Remote Desktop & VPN" },
                    { 24, 6, "FTP & File Sharing" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Login", "PasswordHash", "RoleId" },
                values: new object[,]
                {
                    { 1, "admin@example.com", "admin", "AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==", 1 },
                    { 2, "user1@example.com", "user1", "AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==", 2 },
                    { 3, "bob@example.com", "bob", "AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContentUnitImages_ContentUnitId",
                table: "ContentUnitImages",
                column: "ContentUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ContentUnits_SubCategoryId",
                table: "ContentUnits",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ContentUnitSubCategories_MainCategoryId",
                table: "ContentUnitSubCategories",
                column: "MainCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentUnitImages");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "ContentUnits");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "ContentUnitSubCategories");

            migrationBuilder.DropTable(
                name: "ContentUnitMainCategories");
        }
    }
}
