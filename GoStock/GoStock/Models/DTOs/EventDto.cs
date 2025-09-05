using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace GoStock.Models.DTOs
{
    public class EventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime AgendaDate { get; set; }
        public TimeSpan AgendaTime { get; set; }
        public string Priority { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public int UserId { get; set; }
    }

    public class CreateEventDto
    {
        [Required(ErrorMessage = "Ajanda başlığı zorunludur")]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Ajanda tarihi zorunludur")]
        public DateTime AgendaDate { get; set; }
        
        [Required(ErrorMessage = "Ajanda saati zorunludur")]
        [RegularExpression(@"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Geçerli saat formatı giriniz (HH:mm)")]
        public string AgendaTime { get; set; } = string.Empty;
        
        public string Priority { get; set; } = "medium";
        public string Status { get; set; } = "pending";
        public bool IsCompleted { get; set; } = false;
    }

    public class UpdateEventDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? AgendaDate { get; set; }
        public string? AgendaTime { get; set; }
        public string? Priority { get; set; }
        public string? Status { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
