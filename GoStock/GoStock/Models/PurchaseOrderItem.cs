using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class PurchaseOrderItem
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Sipariş ID zorunludur")]
        public int PurchaseOrderId { get; set; }
        
        [Required(ErrorMessage = "Ürün ID zorunludur")]
        public int ProductId { get; set; }
        
        [Required(ErrorMessage = "Miktar zorunludur")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar 1'den büyük olmalıdır")]
        public int Quantity { get; set; }
        
        [Required(ErrorMessage = "Birim fiyat zorunludur")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan büyük olmalıdır")]
        public decimal UnitPrice { get; set; }
        
        [Required(ErrorMessage = "Toplam fiyat zorunludur")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Toplam fiyat 0'dan büyük olmalıdır")]
        public decimal TotalPrice { get; set; }
        
        // Navigation properties
        public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}
