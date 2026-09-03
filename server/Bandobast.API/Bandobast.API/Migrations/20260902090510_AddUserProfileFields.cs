using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bandobast.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreferredLocalityId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PreferredLocalityId",
                table: "Users",
                column: "PreferredLocalityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Localities_PreferredLocalityId",
                table: "Users",
                column: "PreferredLocalityId",
                principalTable: "Localities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Localities_PreferredLocalityId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_PreferredLocalityId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PreferredLocalityId",
                table: "Users");
        }
    }
}
