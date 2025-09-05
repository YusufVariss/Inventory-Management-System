using GoStock.Models;
using GoStock.Models.DTOs;
using GoStock.Repositories;
using Microsoft.Extensions.Logging;

namespace GoStock.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync()
        {
            try
            {
                var notifications = await _notificationRepository.GetAllNotificationsAsync();
                return notifications.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tüm bildirimler getirilirken hata oluştu");
                throw;
            }
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(int id)
        {
            try
            {
                var notification = await _notificationRepository.GetNotificationByIdAsync(id);
                return notification != null ? MapToDto(notification) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} getirilirken hata oluştu", id);
                throw;
            }
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByUserAsync(string userId)
        {
            try
            {
                var notifications = await _notificationRepository.GetNotificationsByUserAsync(userId);
                return notifications.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID: {UserId} için bildirimler getirilirken hata oluştu", userId);
                throw;
            }
        }

        public async Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync()
        {
            try
            {
                var notifications = await _notificationRepository.GetUnreadNotificationsAsync();
                return notifications.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Okunmamış bildirimler getirilirken hata oluştu");
                throw;
            }
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto)
        {
            try
            {
                var notification = new Notification
                {
                    Message = createNotificationDto.Message,
                    Type = createNotificationDto.Type,
                    Action = createNotificationDto.Action,
                    Page = createNotificationDto.Page,
                    PageName = createNotificationDto.PageName,
                    RelatedEntityType = createNotificationDto.RelatedEntityType,
                    RelatedEntityId = createNotificationDto.RelatedEntityId,
                    UserId = createNotificationDto.UserId,
                    UserEmail = createNotificationDto.UserEmail,
                    Priority = createNotificationDto.Priority,
                    ExpiresAt = createNotificationDto.ExpiresAt
                };

                var createdNotification = await _notificationRepository.CreateNotificationAsync(notification);
                _logger.LogInformation("Yeni bildirim oluşturuldu: {Message}", notification.Message);
                
                return MapToDto(createdNotification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim oluşturulurken hata oluştu");
                throw;
            }
        }

        public async Task<NotificationDto> UpdateNotificationAsync(int id, UpdateNotificationDto updateNotificationDto)
        {
            try
            {
                var existingNotification = await _notificationRepository.GetNotificationByIdAsync(id);
                if (existingNotification == null)
                    throw new ArgumentException($"ID: {id} olan bildirim bulunamadı");

                existingNotification.IsRead = updateNotificationDto.IsRead;
                existingNotification.ReadAt = updateNotificationDto.IsRead ? DateTime.Now : null;
                existingNotification.IsActive = updateNotificationDto.IsActive;

                var updatedNotification = await _notificationRepository.UpdateNotificationAsync(existingNotification);
                return MapToDto(updatedNotification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} güncellenirken hata oluştu", id);
                throw;
            }
        }

        public async Task<bool> DeleteNotificationAsync(int id)
        {
            try
            {
                var result = await _notificationRepository.DeleteNotificationAsync(id);
                if (result)
                    _logger.LogInformation("Bildirim ID: {Id} silindi", id);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} silinirken hata oluştu", id);
                throw;
            }
        }

        public async Task<bool> MarkNotificationAsReadAsync(int id)
        {
            try
            {
                var result = await _notificationRepository.MarkNotificationAsReadAsync(id);
                if (result)
                    _logger.LogInformation("Bildirim ID: {Id} okundu olarak işaretlendi", id);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} okundu işaretlenirken hata oluştu", id);
                throw;
            }
        }

        public async Task<bool> MarkAllNotificationsAsReadAsync(string userId)
        {
            try
            {
                var result = await _notificationRepository.MarkAllNotificationsAsReadAsync(userId);
                if (result)
                    _logger.LogInformation("Kullanıcı ID: {UserId} için tüm bildirimler okundu olarak işaretlendi", userId);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID: {UserId} için tüm bildirimler okundu işaretlenirken hata oluştu", userId);
                throw;
            }
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            try
            {
                return await _notificationRepository.GetUnreadCountAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID: {UserId} için okunmamış bildirim sayısı getirilirken hata oluştu", userId);
                throw;
            }
        }

        // Otomatik bildirim oluşturma metodları
        public async Task CreateProductAddedNotificationAsync(int productId, string productName, string userId)
        {
            try
            {
                var notificationDto = new CreateNotificationDto
                {
                    Message = $"Yeni ürün eklendi: {productName}",
                    Type = "success",
                    Action = "Görüntüle",
                    Page = "/products",
                    PageName = "Ürünler",
                    RelatedEntityType = "Product",
                    RelatedEntityId = productId,
                    UserId = userId,
                    Priority = "medium",
                    ExpiresAt = DateTime.Now.AddDays(7) // 7 gün sonra geçersiz
                };

                await CreateNotificationAsync(notificationDto);
                _logger.LogInformation("Ürün ekleme bildirimi oluşturuldu: {ProductName}", productName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün ekleme bildirimi oluşturulurken hata oluştu: {ProductName}", productName);
            }
        }

        public async Task CreateProductDeletedNotificationAsync(int productId, string productName, string userId)
        {
            try
            {
                var notificationDto = new CreateNotificationDto
                {
                    Message = $"Ürün silindi: {productName}",
                    Type = "warning",
                    Action = "Görüntüle",
                    Page = "/products",
                    PageName = "Ürünler",
                    RelatedEntityType = "Product",
                    RelatedEntityId = productId,
                    UserId = userId,
                    Priority = "high",
                    ExpiresAt = DateTime.Now.AddDays(3) // 3 gün sonra geçersiz
                };

                await CreateNotificationAsync(notificationDto);
                _logger.LogInformation("Ürün silme bildirimi oluşturuldu: {ProductName}", productName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün silme bildirimi oluşturulurken hata oluştu: {ProductName}", productName);
            }
        }

        public async Task CreateCriticalStockNotificationAsync(int productId, string productName, int currentStock, int minStock)
        {
            try
            {
                var notificationDto = new CreateNotificationDto
                {
                    Message = $"Kritik stok uyarısı: {productName} (Mevcut: {currentStock}, Minimum: {minStock})",
                    Type = "critical",
                    Action = "Stok Ekle",
                    Page = "/stock-movements",
                    PageName = "Stok Hareketleri",
                    RelatedEntityType = "Product",
                    RelatedEntityId = productId,
                    Priority = "high",
                    ExpiresAt = DateTime.Now.AddDays(1) // 1 gün sonra geçersiz
                };

                await CreateNotificationAsync(notificationDto);
                _logger.LogWarning("Kritik stok bildirimi oluşturuldu: {ProductName} (Stok: {CurrentStock})", productName, currentStock);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kritik stok bildirimi oluşturulurken hata oluştu: {ProductName}", productName);
            }
        }

        public async Task CreateEventAddedNotificationAsync(int eventId, string eventTitle, string userId)
        {
            try
            {
                var notificationDto = new CreateNotificationDto
                {
                    Message = $"Yeni etkinlik eklendi: {eventTitle}",
                    Type = "info",
                    Action = "Görüntüle",
                    Page = "/agenda",
                    PageName = "Ajanda",
                    RelatedEntityType = "Event",
                    RelatedEntityId = eventId,
                    UserId = userId,
                    Priority = "medium",
                    ExpiresAt = DateTime.Now.AddDays(5) // 5 gün sonra geçersiz
                };

                await CreateNotificationAsync(notificationDto);
                _logger.LogInformation("Etkinlik ekleme bildirimi oluşturuldu: {EventTitle}", eventTitle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik ekleme bildirimi oluşturulurken hata oluştu: {EventTitle}", eventTitle);
            }
        }

        public async Task CreateReturnAddedNotificationAsync(int returnId, string returnReason, string userId)
        {
            try
            {
                var notificationDto = new CreateNotificationDto
                {
                    Message = $"Yeni iade eklendi: {returnReason}",
                    Type = "warning",
                    Action = "Görüntüle",
                    Page = "/returns",
                    PageName = "İadeler",
                    RelatedEntityType = "Return",
                    RelatedEntityId = returnId,
                    UserId = userId,
                    Priority = "medium",
                    ExpiresAt = DateTime.Now.AddDays(7) // 7 gün sonra geçersiz
                };

                await CreateNotificationAsync(notificationDto);
                _logger.LogInformation("İade ekleme bildirimi oluşturuldu: {ReturnReason}", returnReason);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade ekleme bildirimi oluşturulurken hata oluştu: {ReturnReason}", returnReason);
            }
        }

        public async Task CreateLowStockNotificationAsync(int productId, string productName, int currentStock, int minStock)
        {
            try
            {
                var notificationDto = new CreateNotificationDto
                {
                    Message = $"Düşük stok uyarısı: {productName} (Mevcut: {currentStock}, Minimum: {minStock})",
                    Type = "warning",
                    Action = "Stok Ekle",
                    Page = "/stock-movements",
                    PageName = "Stok Hareketleri",
                    RelatedEntityType = "Product",
                    RelatedEntityId = productId,
                    Priority = "medium",
                    ExpiresAt = DateTime.Now.AddDays(3) // 3 gün sonra geçersiz
                };

                await CreateNotificationAsync(notificationDto);
                _logger.LogWarning("Düşük stok bildirimi oluşturuldu: {ProductName} (Stok: {CurrentStock})", productName, currentStock);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Düşük stok bildirimi oluşturulurken hata oluştu: {ProductName}", productName);
            }
        }

        public async Task<bool> DeleteExpiredNotificationsAsync()
        {
            try
            {
                var result = await _notificationRepository.DeleteExpiredNotificationsAsync();
                if (result)
                    _logger.LogInformation("Süresi dolmuş bildirimler temizlendi");
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Süresi dolmuş bildirimler temizlenirken hata oluştu");
                throw;
            }
        }

        public async Task<bool> CleanupOldNotificationsAsync(int daysToKeep)
        {
            try
            {
                var cutoffDate = DateTime.Now.AddDays(-daysToKeep);
                var oldNotifications = await _notificationRepository.GetAllNotificationsAsync();
                var notificationsToDelete = oldNotifications.Where(n => n.CreatedAt < cutoffDate).ToList();

                foreach (var notification in notificationsToDelete)
                {
                    await _notificationRepository.DeleteNotificationAsync(notification.Id);
                }

                _logger.LogInformation("{Count} eski bildirim temizlendi ({DaysToKeep} günden eski)", 
                    notificationsToDelete.Count, daysToKeep);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eski bildirimler temizlenirken hata oluştu");
                throw;
            }
        }

        private static NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Message = notification.Message,
                Type = notification.Type,
                Action = notification.Action,
                Page = notification.Page,
                PageName = notification.PageName,
                IsRead = notification.IsRead,
                Read = notification.IsRead, // Frontend compatibility
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt,
                RelatedEntityType = notification.RelatedEntityType,
                RelatedEntityId = notification.RelatedEntityId,
                UserId = notification.UserId,
                UserEmail = notification.UserEmail,
                IsActive = notification.IsActive,
                Priority = notification.Priority,
                ExpiresAt = notification.ExpiresAt,
                Time = GetTimeAgo(notification.CreatedAt)
            };
        }

        private static string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;
            
            if (timeSpan.TotalMinutes < 1)
                return "Az önce";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} dakika önce";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} saat önce";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} gün önce";
            
            return dateTime.ToString("dd.MM.yyyy HH:mm");
        }
    }
}
