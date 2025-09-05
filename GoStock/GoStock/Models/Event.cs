using System.ComponentModel.DataAnnotations;

namespace GoStock.Models
{
    public class Event
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Ajanda başlığı zorunludur")]
        [StringLength(200, ErrorMessage = "Ajanda başlığı en fazla 200 karakter olabilir")]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Ajanda tarihi zorunludur")]
        public DateTime AgendaDate { get; set; }
        
        [Required(ErrorMessage = "Ajanda saati zorunludur")]
        public TimeSpan AgendaTime { get; set; }
        
        [Required(ErrorMessage = "Öncelik zorunludur")]
        [StringLength(20, ErrorMessage = "Öncelik en fazla 20 karakter olabilir")]
        public string Priority { get; set; } = "medium"; // low, medium, high
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        [StringLength(20, ErrorMessage = "Durum en fazla 20 karakter olabilir")]
        public string Status { get; set; } = "pending"; // pending, completed, cancelled
        
        public bool IsCompleted { get; set; } = false;
    }
}
