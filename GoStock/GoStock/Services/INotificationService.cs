using GoStock.Models.DTOs;

namespace GoStock.Services
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync();
        Task<NotificationDto?> GetNotificationByIdAsync(int id);
        Task<IEnumerable<NotificationDto>> GetNotificationsByUserAsync(string userId);
        Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync();
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto);
        Task<NotificationDto> UpdateNotificationAsync(int id, UpdateNotificationDto updateNotificationDto);
        Task<bool> DeleteNotificationAsync(int id);
        Task<bool> MarkNotificationAsReadAsync(int id);
        Task<bool> MarkAllNotificationsAsReadAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        
        // Otomatik bildirim oluşturma metodları
        Task CreateProductAddedNotificationAsync(int productId, string productName, string userId);
        Task CreateProductDeletedNotificationAsync(int productId, string productName, string userId);
        Task CreateCriticalStockNotificationAsync(int productId, string productName, int currentStock, int minStock);
        Task CreateEventAddedNotificationAsync(int eventId, string eventTitle, string userId);
        Task CreateReturnAddedNotificationAsync(int returnId, string returnReason, string userId);
        Task CreateLowStockNotificationAsync(int productId, string productName, int currentStock, int minStock);
        
        // Bildirim temizleme
        Task<bool> DeleteExpiredNotificationsAsync();
        Task<bool> CleanupOldNotificationsAsync(int daysToKeep);
    }
}
