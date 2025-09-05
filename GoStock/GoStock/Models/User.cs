using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GoStock.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Kullanıcı adı zorunludur")]
        [StringLength(100, ErrorMessage = "Kullanıcı adı en fazla 100 karakter olabilir")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-posta zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        [StringLength(150, ErrorMessage = "E-posta en fazla 150 karakter olabilir")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur")]
        [StringLength(100, ErrorMessage = "Şifre en fazla 100 karakter olabilir")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ad soyad zorunludur")]
        [StringLength(100, ErrorMessage = "Ad soyad en fazla 100 karakter olabilir")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Rol zorunludur")]
        [StringLength(50, ErrorMessage = "Rol en fazla 50 karakter olabilir")]
        public string Role { get; set; } = "user";

        [Required(ErrorMessage = "Aktif durum zorunludur")]
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties - JSON serialization için ignore edildi
        public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
        [JsonIgnore]
        public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
        [JsonIgnore]
        public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
        [JsonIgnore]
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
        [JsonIgnore]
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
