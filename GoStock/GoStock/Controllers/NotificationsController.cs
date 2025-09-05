using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetNotificationsByUserAsync(userId);
                
                _logger.LogInformation("Kullanıcı ID: {UserId} için {Count} bildirim getirildi", userId, notifications.Count());
                
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirimler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Bildirimler getirilemedi" });
            }
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetUnreadNotificationsAsync();
                
                // Sadece kullanıcının bildirimlerini filtrele
                var userNotifications = notifications.Where(n => n.UserId == userId || string.IsNullOrEmpty(n.UserId));
                
                _logger.LogInformation("Kullanıcı ID: {UserId} için {Count} okunmamış bildirim getirildi", userId, userNotifications.Count());
                
                return Ok(userNotifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Okunmamış bildirimler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Okunmamış bildirimler getirilemedi" });
            }
        }

        [HttpGet("count/unread")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _notificationService.GetUnreadCountAsync(userId);
                
                return Ok(new { unreadCount = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Okunmamış bildirim sayısı getirilirken hata oluştu");
                return StatusCode(500, new { message = "Okunmamış bildirim sayısı getirilemedi" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(int id)
        {
            try
            {
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                if (notification == null)
                    return NotFound(new { message = "Bildirim bulunamadı" });

                // Kullanıcının kendi bildirimi mi kontrol et
                var userId = GetCurrentUserId();
                if (!string.IsNullOrEmpty(notification.UserId) && notification.UserId != userId)
                    return Forbid();

                return Ok(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} getirilirken hata oluştu", id);
                return StatusCode(500, new { message = "Bildirim getirilemedi" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto createNotificationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetCurrentUserId();
                createNotificationDto.UserId = userId;

                var notification = await _notificationService.CreateNotificationAsync(createNotificationDto);
                
                _logger.LogInformation("Yeni bildirim oluşturuldu: {Message}", notification.Message);
                
                return CreatedAtAction(nameof(GetNotificationById), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim oluşturulurken hata oluştu");
                return StatusCode(500, new { message = "Bildirim oluşturulamadı" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(int id, [FromBody] UpdateNotificationDto updateNotificationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existingNotification = await _notificationService.GetNotificationByIdAsync(id);
                if (existingNotification == null)
                    return NotFound(new { message = "Bildirim bulunamadı" });

                // Kullanıcının kendi bildirimi mi kontrol et
                var userId = GetCurrentUserId();
                if (!string.IsNullOrEmpty(existingNotification.UserId) && existingNotification.UserId != userId)
                    return Forbid();

                var updatedNotification = await _notificationService.UpdateNotificationAsync(id, updateNotificationDto);
                
                _logger.LogInformation("Bildirim ID: {Id} güncellendi", id);
                
                return Ok(updatedNotification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} güncellenirken hata oluştu", id);
                return StatusCode(500, new { message = "Bildirim güncellenemedi" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var existingNotification = await _notificationService.GetNotificationByIdAsync(id);
                if (existingNotification == null)
                    return NotFound(new { message = "Bildirim bulunamadı" });

                // Kullanıcının kendi bildirimi mi kontrol et
                var userId = GetCurrentUserId();
                if (!string.IsNullOrEmpty(existingNotification.UserId) && existingNotification.UserId != userId)
                    return Forbid();

                var result = await _notificationService.DeleteNotificationAsync(id);
                if (!result)
                    return BadRequest(new { message = "Bildirim silinemedi" });

                _logger.LogInformation("Bildirim ID: {Id} silindi", id);
                
                return Ok(new { message = "Bildirim başarıyla silindi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} silinirken hata oluştu", id);
                return StatusCode(500, new { message = "Bildirim silinemedi" });
            }
        }

        [HttpPost("{id}/mark-read")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            try
            {
                var existingNotification = await _notificationService.GetNotificationByIdAsync(id);
                if (existingNotification == null)
                    return NotFound(new { message = "Bildirim bulunamadı" });

                // Kullanıcının kendi bildirimi mi kontrol et
                var userId = GetCurrentUserId();
                if (!string.IsNullOrEmpty(existingNotification.UserId) && existingNotification.UserId != userId)
                    return Forbid();

                var result = await _notificationService.MarkNotificationAsReadAsync(id);
                if (!result)
                    return BadRequest(new { message = "Bildirim okundu olarak işaretlenemedi" });

                _logger.LogInformation("Bildirim ID: {Id} okundu olarak işaretlendi", id);
                
                return Ok(new { message = "Bildirim okundu olarak işaretlendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirim ID: {Id} okundu işaretlenirken hata oluştu", id);
                return StatusCode(500, new { message = "Bildirim okundu işaretlenemedi" });
            }
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.MarkAllNotificationsAsReadAsync(userId);
                
                if (result)
                {
                    _logger.LogInformation("Kullanıcı ID: {UserId} için tüm bildirimler okundu olarak işaretlendi", userId);
                    return Ok(new { message = "Tüm bildirimler okundu olarak işaretlendi" });
                }
                else
                {
                    return BadRequest(new { message = "Bildirimler okundu olarak işaretlenemedi" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tüm bildirimler okundu işaretlenirken hata oluştu");
                return StatusCode(500, new { message = "Bildirimler okundu işaretlenemedi" });
            }
        }

        [HttpPost("cleanup")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CleanupNotifications([FromQuery] int daysToKeep = 30)
        {
            try
            {
                var result = await _notificationService.CleanupOldNotificationsAsync(daysToKeep);
                
                if (result)
                {
                    _logger.LogInformation("Eski bildirimler temizlendi ({DaysToKeep} günden eski)", daysToKeep);
                    return Ok(new { message = $"Eski bildirimler temizlendi ({daysToKeep} günden eski)" });
                }
                else
                {
                    return BadRequest(new { message = "Bildirimler temizlenemedi" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bildirimler temizlenirken hata oluştu");
                return StatusCode(500, new { message = "Bildirimler temizlenemedi" });
            }
        }

        private string GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                // Email'den de alabiliriz
                userIdClaim = User.FindFirst(ClaimTypes.Email)?.Value;
            }
            
            return userIdClaim ?? "anonymous";
        }
    }
}
