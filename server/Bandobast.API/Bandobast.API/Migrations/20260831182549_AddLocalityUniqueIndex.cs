using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bandobast.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLocalityUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Localities_PinCode_Name",
                table: "Localities",
                columns: new[] { "PinCode", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Localities_PinCode_Name",
                table: "Localities");
        }
    }
}
