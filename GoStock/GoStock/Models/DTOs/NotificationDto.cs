namespace GoStock.Models.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Page { get; set; } = string.Empty;
        public string PageName { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? UserId { get; set; }
        public string? UserEmail { get; set; }
        public bool IsActive { get; set; }
        public string? Priority { get; set; }
        public DateTime? ExpiresAt { get; set; }
        
        // Frontend için ek alanlar
        public string Time { get; set; } = string.Empty; // "2 saat önce", "1 saat önce" vb.
        public bool Read { get; set; } // Frontend compatibility için
    }

    public class CreateNotificationDto
    {
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Page { get; set; } = string.Empty;
        public string PageName { get; set; } = string.Empty;
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string? Priority { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateNotificationDto
    {
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public bool IsActive { get; set; }
    }
}
