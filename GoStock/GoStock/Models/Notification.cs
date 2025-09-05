using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // critical, warning, success, info
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty; // Stok Ekle, Görüntüle, vb.
        
        [Required]
        [MaxLength(100)]
        public string Page { get; set; } = string.Empty; // /products, /stock-movements, vb.
        
        [Required]
        [MaxLength(100)]
        public string PageName { get; set; } = string.Empty; // Ürünler, Stok Hareketleri, vb.
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime? ReadAt { get; set; }
        
        [MaxLength(100)]
        public string? RelatedEntityType { get; set; } // Product, StockMovement, Event, Return, vb.
        
        public int? RelatedEntityId { get; set; }
        
        [MaxLength(100)]
        public string? UserId { get; set; } // Hangi kullanıcı için bildirim
        
        [MaxLength(100)]
        public string? UserEmail { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(50)]
        public string? Priority { get; set; } // low, medium, high
        
        public DateTime? ExpiresAt { get; set; } // Bildirimin ne zaman geçersiz olacağı
    }
}
