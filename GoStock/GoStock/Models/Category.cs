using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Kategori adı zorunludur")]
        [StringLength(100, ErrorMessage = "Kategori adı en fazla 100 karakter olabilir")]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }
        
        [StringLength(7, ErrorMessage = "Renk kodu en fazla 7 karakter olabilir")]
        public string? Color { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        // public DateTime? UpdatedAt { get; set; } // Geçici olarak kaldırıldı
        
        // Navigation properties
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
