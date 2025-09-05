using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoStock.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingReturnColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Eksik kolonları ekle
            migrationBuilder.AddColumn<string>(
                name: "UserFullName",
                table: "Returns",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Eski kolonları kaldır
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Returns");

            migrationBuilder.DropColumn(
                name: "SaleId",
                table: "Returns");

            migrationBuilder.DropColumn(
                name: "SupplierName",
                table: "Returns");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Returns");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Geri alma işlemleri
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Returns",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SaleId",
                table: "Returns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupplierName",
                table: "Returns",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Returns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.DropColumn(
                name: "UserFullName",
                table: "Returns");
        }
    }
}
