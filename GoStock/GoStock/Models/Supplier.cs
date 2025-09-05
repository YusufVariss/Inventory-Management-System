using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Tedarikçi adı zorunludur")]
        [StringLength(200, ErrorMessage = "Tedarikçi adı en fazla 200 karakter olabilir")]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "İletişim kişisi en fazla 100 karakter olabilir")]
        public string? ContactPerson { get; set; }
        
        [StringLength(20, ErrorMessage = "Telefon en fazla 20 karakter olabilir")]
        public string? Phone { get; set; }
        
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        [StringLength(100, ErrorMessage = "E-posta en fazla 100 karakter olabilir")]
        public string? Email { get; set; }
        
        [StringLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir")]
        public string? Address { get; set; }
        
        [StringLength(50, ErrorMessage = "Vergi numarası en fazla 50 karakter olabilir")]
        public string? TaxNumber { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    }
}
