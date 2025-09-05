using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Setting
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Ayar anahtarı zorunludur")]
        [StringLength(100, ErrorMessage = "Ayar anahtarı en fazla 100 karakter olabilir")]
        public string Key { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "Ayar anahtarı en fazla 100 karakter olabilir")]
        public string SettingKey { get; set; } = string.Empty;
        
        public string? Value { get; set; }
        
        [StringLength(1000, ErrorMessage = "Ayar değeri en fazla 1000 karakter olabilir")]
        public string? SettingValue { get; set; }
        
        [StringLength(100, ErrorMessage = "Kategori en fazla 100 karakter olabilir")]
        public string? Category { get; set; }
        
        [StringLength(100, ErrorMessage = "Grup en fazla 100 karakter olabilir")]
        public string? Group { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        
        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }
        
        public bool IsSystem { get; set; } = false;
        
        public DateTime? UpdatedAt { get; set; }
    }
}
