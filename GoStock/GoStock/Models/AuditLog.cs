using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Tablo adı zorunludur")]
        [StringLength(100, ErrorMessage = "Tablo adı en fazla 100 karakter olabilir")]
        public string TableName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Entity adı zorunludur")]
        [StringLength(100, ErrorMessage = "Entity adı en fazla 100 karakter olabilir")]
        public string EntityName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Kayıt ID zorunludur")]
        public int RecordId { get; set; }
        
        [Required(ErrorMessage = "Entity ID zorunludur")]
        public int EntityId { get; set; }
        
        [StringLength(1000, ErrorMessage = "Detaylar en fazla 1000 karakter olabilir")]
        public string? Details { get; set; }
        
        [StringLength(20, ErrorMessage = "Önem derecesi en fazla 20 karakter olabilir")]
        public string Severity { get; set; } = "Info";
        
        [Required(ErrorMessage = "İşlem tipi zorunludur")]
        [StringLength(20, ErrorMessage = "İşlem tipi en fazla 20 karakter olabilir")]
        public string Action { get; set; } = string.Empty; // INSERT, UPDATE, DELETE
        
        public string? OldValues { get; set; }
        
        public string? NewValues { get; set; }
        
        public int? UserId { get; set; }
        
        [Required(ErrorMessage = "Zaman damgası zorunludur")]
        public DateTime Timestamp { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        [StringLength(45, ErrorMessage = "IP adresi en fazla 45 karakter olabilir")]
        public string? IPAddress { get; set; }
        
        [StringLength(500, ErrorMessage = "User agent en fazla 500 karakter olabilir")]
        public string? UserAgent { get; set; }
        
        // Navigation property
        public virtual User? User { get; set; }
    }
}
