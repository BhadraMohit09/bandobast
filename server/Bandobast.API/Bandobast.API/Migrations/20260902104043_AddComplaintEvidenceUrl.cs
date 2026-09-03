using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bandobast.API.Migrations
{
    /// <inheritdoc />
    public partial class AddComplaintEvidenceUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EvidenceUrl",
                table: "Complaints",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EvidenceUrl",
                table: "Complaints");
        }
    }
}
