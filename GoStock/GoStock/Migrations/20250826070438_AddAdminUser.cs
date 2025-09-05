using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoStock.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Admin kullanıcısını ekle (sadece gerekli alanlar)
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Username", "Email", "Password", "FullName", "Role", "IsActive" },
                values: new object[] { 2, "admin", "admin@test.com", "admin", "Sistem Yöneticisi", "Admin", true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Admin kullanıcısını sil
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
