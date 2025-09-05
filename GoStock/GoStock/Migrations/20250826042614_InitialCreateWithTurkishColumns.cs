using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoStock.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateWithTurkishColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Products_ProductId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Users_UserId",
                table: "StockMovements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StockMovements",
                table: "StockMovements");

            migrationBuilder.RenameTable(
                name: "StockMovements",
                newName: "StokHareketleri");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "StokHareketleri",
                newName: "KullaniciId");

            migrationBuilder.RenameColumn(
                name: "UnitPrice",
                table: "StokHareketleri",
                newName: "BirimFiyat");

            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "StokHareketleri",
                newName: "ToplamTutar");

            migrationBuilder.RenameColumn(
                name: "Reference",
                table: "StokHareketleri",
                newName: "Referans");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "StokHareketleri",
                newName: "Miktar");

            migrationBuilder.RenameColumn(
                name: "PreviousStock",
                table: "StokHareketleri",
                newName: "OncekiStok");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "StokHareketleri",
                newName: "Notlar");

            migrationBuilder.RenameColumn(
                name: "NewStock",
                table: "StokHareketleri",
                newName: "YeniStok");

            migrationBuilder.RenameColumn(
                name: "MovementType",
                table: "StokHareketleri",
                newName: "HareketTuru");

            migrationBuilder.RenameColumn(
                name: "MovementDate",
                table: "StokHareketleri",
                newName: "HareketTarihi");

            migrationBuilder.RenameIndex(
                name: "IX_StockMovements_UserId",
                table: "StokHareketleri",
                newName: "IX_StokHareketleri_KullaniciId");

            migrationBuilder.RenameIndex(
                name: "IX_StockMovements_ProductId",
                table: "StokHareketleri",
                newName: "IX_StokHareketleri_ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_StockMovements_MovementType",
                table: "StokHareketleri",
                newName: "IX_StokHareketleri_HareketTuru");

            migrationBuilder.RenameIndex(
                name: "IX_StockMovements_MovementDate",
                table: "StokHareketleri",
                newName: "IX_StokHareketleri_HareketTarihi");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StokHareketleri",
                table: "StokHareketleri",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StokHareketleri_Products_ProductId",
                table: "StokHareketleri",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StokHareketleri_Users_KullaniciId",
                table: "StokHareketleri",
                column: "KullaniciId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StokHareketleri_Products_ProductId",
                table: "StokHareketleri");

            migrationBuilder.DropForeignKey(
                name: "FK_StokHareketleri_Users_KullaniciId",
                table: "StokHareketleri");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StokHareketleri",
                table: "StokHareketleri");

            migrationBuilder.RenameTable(
                name: "StokHareketleri",
                newName: "StockMovements");

            migrationBuilder.RenameColumn(
                name: "YeniStok",
                table: "StockMovements",
                newName: "NewStock");

            migrationBuilder.RenameColumn(
                name: "ToplamTutar",
                table: "StockMovements",
                newName: "TotalAmount");

            migrationBuilder.RenameColumn(
                name: "Referans",
                table: "StockMovements",
                newName: "Reference");

            migrationBuilder.RenameColumn(
                name: "OncekiStok",
                table: "StockMovements",
                newName: "PreviousStock");

            migrationBuilder.RenameColumn(
                name: "Notlar",
                table: "StockMovements",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "Miktar",
                table: "StockMovements",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "KullaniciId",
                table: "StockMovements",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "HareketTuru",
                table: "StockMovements",
                newName: "MovementType");

            migrationBuilder.RenameColumn(
                name: "HareketTarihi",
                table: "StockMovements",
                newName: "MovementDate");

            migrationBuilder.RenameColumn(
                name: "BirimFiyat",
                table: "StockMovements",
                newName: "UnitPrice");

            migrationBuilder.RenameIndex(
                name: "IX_StokHareketleri_ProductId",
                table: "StockMovements",
                newName: "IX_StockMovements_ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_StokHareketleri_KullaniciId",
                table: "StockMovements",
                newName: "IX_StockMovements_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_StokHareketleri_HareketTuru",
                table: "StockMovements",
                newName: "IX_StockMovements_MovementType");

            migrationBuilder.RenameIndex(
                name: "IX_StokHareketleri_HareketTarihi",
                table: "StockMovements",
                newName: "IX_StockMovements_MovementDate");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StockMovements",
                table: "StockMovements",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Products_ProductId",
                table: "StockMovements",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Users_UserId",
                table: "StockMovements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
