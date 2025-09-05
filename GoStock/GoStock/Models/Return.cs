using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Return
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "İade tipi zorunludur")]
        [StringLength(20, ErrorMessage = "İade tipi en fazla 20 karakter olabilir")]
        public string ReturnType { get; set; } = string.Empty; // customer, supplier
        
        [Required(ErrorMessage = "Ürün adı zorunludur")]
        [StringLength(200, ErrorMessage = "Ürün adı en fazla 200 karakter olabilir")]
        public string ProductName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Miktar zorunludur")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar 1'den büyük olmalıdır")]
        public int Quantity { get; set; }
        
        [Required(ErrorMessage = "İade nedeni zorunludur")]
        [StringLength(500, ErrorMessage = "İade nedeni en fazla 500 karakter olabilir")]
        public string Reason { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Durum zorunludur")]
        [StringLength(20, ErrorMessage = "Durum en fazla 20 karakter olabilir")]
        public string Status { get; set; } = "pending"; // pending, approved, completed, rejected
        
        public decimal? Amount { get; set; } = null; // Backend'de otomatik hesaplanacak
        
        public DateTime ReturnDate { get; set; }
        
        public DateTime? ProcessedDate { get; set; }
        
        [StringLength(100, ErrorMessage = "Müşteri adı en fazla 100 karakter olabilir")]
        public string? CustomerName { get; set; }
        
        [StringLength(100, ErrorMessage = "Kullanıcı adı en fazla 100 karakter olabilir")]
        public string? UserFullName { get; set; }
        
        // Navigation properties removed - using ProductName instead of ProductId
    }
}
