using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class PurchaseOrder
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Tedarikçi ID zorunludur")]
        public int SupplierId { get; set; }
        
        [Required(ErrorMessage = "Sipariş numarası zorunludur")]
        [StringLength(50, ErrorMessage = "Sipariş numarası en fazla 50 karakter olabilir")]
        public string OrderNumber { get; set; } = string.Empty;
        
        public DateTime OrderDate { get; set; }
        
        public DateTime? ExpectedDeliveryDate { get; set; }
        
        [Required(ErrorMessage = "Durum zorunludur")]
        [StringLength(20, ErrorMessage = "Durum en fazla 20 karakter olabilir")]
        public string Status { get; set; } = "pending"; // pending, confirmed, delivered, cancelled
        
        [Required(ErrorMessage = "Toplam tutar zorunludur")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Toplam tutar 0'dan büyük olmalıdır")]
        public decimal TotalAmount { get; set; }
        
        [StringLength(1000, ErrorMessage = "Notlar en fazla 1000 karakter olabilir")]
        public string? Notes { get; set; }
        
        [Required(ErrorMessage = "Kullanıcı ID zorunludur")]
        public int UserId { get; set; }
        
        public int? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public int? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
        [StringLength(500, ErrorMessage = "Red nedeni en fazla 500 karakter olabilir")]
        public string? RejectionReason { get; set; }
        
        // Navigation properties
        public virtual Supplier Supplier { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();
    }
}
