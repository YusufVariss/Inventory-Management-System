using GoStock.Models;

namespace GoStock.Repositories
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetAllNotificationsAsync();
        Task<Notification?> GetNotificationByIdAsync(int id);
        Task<IEnumerable<Notification>> GetNotificationsByUserAsync(string userId);
        Task<IEnumerable<Notification>> GetUnreadNotificationsAsync();
        Task<IEnumerable<Notification>> GetNotificationsByTypeAsync(string type);
        Task<IEnumerable<Notification>> GetActiveNotificationsAsync();
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task<Notification> UpdateNotificationAsync(Notification notification);
        Task<bool> DeleteNotificationAsync(int id);
        Task<bool> MarkNotificationAsReadAsync(int id);
        Task<bool> MarkAllNotificationsAsReadAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<bool> DeleteExpiredNotificationsAsync();
        Task<IEnumerable<Notification>> GetNotificationsByEntityAsync(string entityType, int entityId);
    }
}
