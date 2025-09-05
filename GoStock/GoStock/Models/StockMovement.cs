using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GoStock.Models
{
    [Table("StokHareketleri")]
    public class StockMovement
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }
        
        [Column("ProductId")]
        public int? ProductId { get; set; }
        
        [Required(ErrorMessage = "Hareket tipi zorunludur")]
        [StringLength(20, ErrorMessage = "Hareket tipi en fazla 20 karakter olabilir")]
        [Column("HareketTuru")]
        public string MovementType { get; set; } = string.Empty; // in, out, transfer, adjustment
        
        [Required(ErrorMessage = "Miktar zorunludur")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar 1'den büyük olmalıdır")]
        [Column("Miktar")]
        public int Quantity { get; set; }
        
        [Required(ErrorMessage = "Önceki stok zorunludur")]
        [Range(0, int.MaxValue, ErrorMessage = "Önceki stok 0'dan küçük olamaz")]
        [Column("OncekiStok")]
        public int PreviousStock { get; set; }
        
        [Required(ErrorMessage = "Yeni stok zorunludur")]
        [Range(0, int.MaxValue, ErrorMessage = "Yeni stok 0'dan küçük olamaz")]
        [Column("YeniStok")]
        public int NewStock { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan küçük olamaz")]
        [Column("BirimFiyat")]
        public decimal? UnitPrice { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Toplam tutar 0'dan küçük olamaz")]
        [Column("ToplamTutar")]
        public decimal? TotalAmount { get; set; }
        
        [StringLength(100, ErrorMessage = "Referans en fazla 100 karakter olabilir")]
        [Column("Referans")]
        public string? Reference { get; set; } // Fatura no, transfer no, vb.
        
        [StringLength(500, ErrorMessage = "Notlar en fazla 500 karakter olabilir")]
        [Column("Notlar")]
        public string? Notes { get; set; }
        
        [Required(ErrorMessage = "Hareket tarihi zorunludur")]
        [Column("HareketTarihi")]
        public DateTime MovementDate { get; set; }
        
        [Column("KullaniciId")]
        public int? UserId { get; set; }
        
        // Navigation properties
        public virtual Product? Product { get; set; }
        public virtual User? User { get; set; }
    }
}
