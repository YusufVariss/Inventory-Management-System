using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class UserPermission
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Kullanıcı ID zorunludur")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "Yetki zorunludur")]
        [StringLength(50, ErrorMessage = "Yetki en fazla 50 karakter olabilir")]
        public string Permission { get; set; } = string.Empty;
        
        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}
