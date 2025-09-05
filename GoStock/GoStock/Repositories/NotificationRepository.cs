using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly GoStockDbContext _context;

        public NotificationRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Notification>> GetAllNotificationsAsync()
        {
            return await _context.Notifications
                .Where(n => n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Notification?> GetNotificationByIdAsync(int id)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.IsActive);
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByUserAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetUnreadNotificationsAsync()
        {
            return await _context.Notifications
                .Where(n => !n.IsRead && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByTypeAsync(string type)
        {
            return await _context.Notifications
                .Where(n => n.Type == type && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetActiveNotificationsAsync()
        {
            var now = DateTime.Now;
            return await _context.Notifications
                .Where(n => n.IsActive && (n.ExpiresAt == null || n.ExpiresAt > now))
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            notification.CreatedAt = DateTime.Now;
            notification.IsActive = true;
            
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            
            return notification;
        }

        public async Task<Notification> UpdateNotificationAsync(Notification notification)
        {
            var existingNotification = await _context.Notifications.FindAsync(notification.Id);
            if (existingNotification == null)
                throw new ArgumentException("Bildirim bulunamadı");

            existingNotification.Message = notification.Message;
            existingNotification.Type = notification.Type;
            existingNotification.Action = notification.Action;
            existingNotification.Page = notification.Page;
            existingNotification.PageName = notification.PageName;
            existingNotification.IsRead = notification.IsRead;
            existingNotification.ReadAt = notification.ReadAt;
            existingNotification.IsActive = notification.IsActive;
            existingNotification.Priority = notification.Priority;
            existingNotification.ExpiresAt = notification.ExpiresAt;

            await _context.SaveChangesAsync();
            return existingNotification;
        }

        public async Task<bool> DeleteNotificationAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return false;

            notification.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkNotificationAsReadAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return false;

            notification.IsRead = true;
            notification.ReadAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllNotificationsAsReadAsync(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead && n.IsActive)
                .ToListAsync();

            if (!notifications.Any())
                return false;

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead && n.IsActive);
        }

        public async Task<bool> DeleteExpiredNotificationsAsync()
        {
            var now = DateTime.Now;
            var expiredNotifications = await _context.Notifications
                .Where(n => n.ExpiresAt != null && n.ExpiresAt < now && n.IsActive)
                .ToListAsync();

            if (!expiredNotifications.Any())
                return false;

            foreach (var notification in expiredNotifications)
            {
                notification.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByEntityAsync(string entityType, int entityId)
        {
            return await _context.Notifications
                .Where(n => n.RelatedEntityType == entityType && n.RelatedEntityId == entityId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
    }
}
