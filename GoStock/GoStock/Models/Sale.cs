using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Sale
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Ürün ID zorunludur")]
        public int ProductId { get; set; }
        
        [Required(ErrorMessage = "Miktar zorunludur")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar 1'den büyük olmalıdır")]
        public int Quantity { get; set; }
        
        [Required(ErrorMessage = "Birim fiyat zorunludur")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan büyük olmalıdır")]
        public decimal UnitPrice { get; set; }
        
        [Required(ErrorMessage = "Toplam tutar zorunludur")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Toplam tutar 0'dan büyük olmalıdır")]
        public decimal TotalAmount { get; set; }
        
        [StringLength(100, ErrorMessage = "Müşteri adı en fazla 100 karakter olabilir")]
        public string? CustomerName { get; set; }
        
        [StringLength(20, ErrorMessage = "Müşteri telefonu en fazla 20 karakter olabilir")]
        public string? CustomerPhone { get; set; }
        
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        [StringLength(100, ErrorMessage = "Müşteri e-postası en fazla 100 karakter olabilir")]
        public string? CustomerEmail { get; set; }
        
        [Required(ErrorMessage = "Satış tarihi zorunludur")]
        public DateTime SaleDate { get; set; }
        
        [StringLength(50, ErrorMessage = "Ödeme yöntemi en fazla 50 karakter olabilir")]
        public string? PaymentMethod { get; set; } // cash, credit_card, bank_transfer
        
        [Required(ErrorMessage = "Durum zorunludur")]
        [StringLength(20, ErrorMessage = "Durum en fazla 20 karakter olabilir")]
        public string Status { get; set; } = "completed"; // pending, completed, cancelled
        
        [StringLength(500, ErrorMessage = "Notlar en fazla 500 karakter olabilir")]
        public string? Notes { get; set; }
        
        [Required(ErrorMessage = "Kullanıcı ID zorunludur")]
        public int UserId { get; set; }
        
        // Navigation properties
        public virtual Product Product { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
