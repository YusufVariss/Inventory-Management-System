using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(
            IAuditLogRepository auditLogRepository,
            ILogger<AuditLogService> logger)
        {
            _auditLogRepository = auditLogRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync()
        {
            try
            {
                return await _auditLogRepository.GetAllAuditLogsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kayıtları getirilirken hata oluştu");
                throw new Exception("Denetim kayıtları getirilemedi");
            }
        }

        public async Task<AuditLog?> GetAuditLogByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz denetim kaydı ID");

            try
            {
                return await _auditLogRepository.GetAuditLogByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı ID: {AuditLogId} getirilirken hata oluştu", id);
                throw new Exception("Denetim kaydı getirilemedi");
            }
        }

        public async Task<AuditLog> CreateAuditLogAsync(AuditLog auditLog)
        {
            if (auditLog == null)
                throw new ArgumentNullException(nameof(auditLog));

            if (auditLog.UserId <= 0)
                throw new ArgumentException("Kullanıcı ID zorunludur");

            if (string.IsNullOrWhiteSpace(auditLog.Action))
                throw new ArgumentException("Eylem zorunludur");

            if (string.IsNullOrWhiteSpace(auditLog.TableName))
                throw new ArgumentException("Tablo adı zorunludur");

            // Denetim kaydı doğrulaması
            if (!await ValidateAuditLogAsync(auditLog))
                throw new Exception("Denetim kaydı doğrulanamadı");

            try
            {
                auditLog.Timestamp = DateTime.Now;

                var createdLog = await _auditLogRepository.CreateAuditLogAsync(auditLog);
                _logger.LogInformation("Yeni denetim kaydı oluşturuldu: {Action} - {TableName}", auditLog.Action, auditLog.TableName);
                return createdLog;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı oluşturulurken hata: {Action}", auditLog.Action);
                throw new Exception("Denetim kaydı oluşturulamadı");
            }
        }

        public async Task<AuditLog> UpdateAuditLogAsync(AuditLog auditLog)
        {
            if (auditLog == null)
                throw new ArgumentNullException(nameof(auditLog));

            if (auditLog.Id <= 0)
                throw new ArgumentException("Geçersiz denetim kaydı ID");

            if (!await _auditLogRepository.AuditLogExistsAsync(auditLog.Id))
                throw new Exception("Denetim kaydı bulunamadı");

            try
            {
                var updatedLog = await _auditLogRepository.UpdateAuditLogAsync(auditLog);
                _logger.LogInformation("Denetim kaydı güncellendi: {AuditLogId}", auditLog.Id);
                return updatedLog;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı güncellenirken hata: {AuditLogId}", auditLog.Id);
                throw new Exception("Denetim kaydı güncellenemedi");
            }
        }

        public async Task<bool> DeleteAuditLogAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz denetim kaydı ID");

            try
            {
                var result = await _auditLogRepository.DeleteAuditLogAsync(id);
                if (result)
                {
                    _logger.LogInformation("Denetim kaydı silindi: {AuditLogId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı silinirken hata: {AuditLogId}", id);
                throw new Exception("Denetim kaydı silinemedi");
            }
        }

        // Denetim kaydı yönetimi
        public async Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _auditLogRepository.GetAuditLogsByUserAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı denetim kayıtları getirilirken hata: {UserId}", userId);
                throw new Exception("Kullanıcı denetim kayıtları getirilemedi");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByActionAsync(string action)
        {
            if (string.IsNullOrWhiteSpace(action))
                throw new ArgumentException("Eylem belirtilmelidir");

            try
            {
                return await _auditLogRepository.GetAuditLogsByActionAsync(action);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eylem denetim kayıtları getirilirken hata: {Action}", action);
                throw new Exception("Eylem denetim kayıtları getirilemedi");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByTableAsync(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                throw new ArgumentException("Tablo adı belirtilmelidir");

            try
            {
                return await _auditLogRepository.GetAuditLogsByTableAsync(tableName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tablo denetim kayıtları getirilirken hata: {TableName}", tableName);
                throw new Exception("Tablo denetim kayıtları getirilemedi");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _auditLogRepository.GetAuditLogsByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı denetim kayıtları getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı denetim kayıtları getirilemedi");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByEntityIdAsync(string entityName, int entityId)
        {
            if (string.IsNullOrWhiteSpace(entityName))
                throw new ArgumentException("Varlık adı belirtilmelidir");
                
            if (entityId <= 0)
                throw new ArgumentException("Geçersiz varlık ID");

            try
            {
                return await _auditLogRepository.GetAuditLogsByEntityIdAsync(entityName, entityId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Varlık denetim kayıtları getirilirken hata: {EntityName} - {EntityId}", entityName, entityId);
                throw new Exception("Varlık denetim kayıtları getirilemedi");
            }
        }

        // Denetim kaydı kontrolü
        public async Task<bool> AuditLogExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz denetim kaydı ID");

            try
            {
                return await _auditLogRepository.AuditLogExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı varlık kontrolü yapılırken hata: {AuditLogId}", id);
                throw new Exception("Denetim kaydı varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalAuditLogsCountAsync()
        {
            try
            {
                return await _auditLogRepository.GetTotalAuditLogsCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam denetim kaydı sayısı getirilirken hata");
                throw new Exception("Toplam denetim kaydı sayısı getirilemedi");
            }
        }

        public async Task<int> GetAuditLogsCountByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _auditLogRepository.GetAuditLogsCountByUserAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı denetim kaydı sayısı getirilirken hata: {UserId}", userId);
                throw new Exception("Kullanıcı denetim kaydı sayısı getirilemedi");
            }
        }

        public async Task<int> GetAuditLogsCountByActionAsync(string action)
        {
            if (string.IsNullOrWhiteSpace(action))
                throw new ArgumentException("Eylem belirtilmelidir");

            try
            {
                return await _auditLogRepository.GetAuditLogsCountByActionAsync(action);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eylem denetim kaydı sayısı getirilirken hata: {Action}", action);
                throw new Exception("Eylem denetim kaydı sayısı getirilemedi");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<AuditLog>> GetAuditLogsWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _auditLogRepository.GetAuditLogsWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı denetim kaydı listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Denetim kaydı listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetRecentAuditLogsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                return await _auditLogRepository.GetRecentAuditLogsAsync(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son denetim kayıtları getirilirken hata: {Count}", count);
                throw new Exception("Son denetim kayıtları getirilemedi");
            }
        }

        // İş mantığı
        public async Task<AuditLog> LogUserActionAsync(int userId, string action, string tableName, int? entityId = null, string? details = null)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (string.IsNullOrWhiteSpace(action))
                throw new ArgumentException("Eylem belirtilmelidir");

            if (string.IsNullOrWhiteSpace(tableName))
                throw new ArgumentException("Tablo adı belirtilmelidir");

            try
            {
                var auditLog = new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    TableName = tableName,
                    EntityId = entityId ?? 0,
                    Details = details,
                    Timestamp = DateTime.Now
                };

                var createdLog = await CreateAuditLogAsync(auditLog);
                _logger.LogInformation("Kullanıcı eylemi kaydedildi: {UserId} - {Action} - {TableName}", userId, action, tableName);
                
                return createdLog;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı eylemi kaydedilirken hata: {UserId} - {Action}", userId, action);
                throw new Exception("Kullanıcı eylemi kaydedilemedi");
            }
        }

        public async Task<AuditLog> LogDataChangeAsync(int userId, string action, string tableName, int entityId, string oldValues, string newValues)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (string.IsNullOrWhiteSpace(action))
                throw new ArgumentException("Eylem belirtilmelidir");

            if (string.IsNullOrWhiteSpace(tableName))
                throw new ArgumentException("Tablo adı belirtilmelidir");

            if (entityId <= 0)
                throw new ArgumentException("Geçersiz varlık ID");

            try
            {
                var details = $"Eski değerler: {oldValues}, Yeni değerler: {newValues}";

                var auditLog = new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    TableName = tableName,
                    EntityId = entityId,
                    Details = details,
                    Timestamp = DateTime.Now
                };

                var createdLog = await CreateAuditLogAsync(auditLog);
                _logger.LogInformation("Veri değişikliği kaydedildi: {UserId} - {Action} - {TableName} - {EntityId}", userId, action, tableName, entityId);
                
                return createdLog;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Veri değişikliği kaydedilirken hata: {UserId} - {Action} - {TableName}", userId, action, tableName);
                throw new Exception("Veri değişikliği kaydedilemedi");
            }
        }

        public Task<bool> ValidateAuditLogAsync(AuditLog auditLog)
        {
            if (auditLog == null)
                return Task.FromResult(false);

            try
            {
                // Kullanıcı ID pozitif mi
                if (auditLog.UserId <= 0)
                    return Task.FromResult(false);

                // Eylem belirtilmiş mi
                if (string.IsNullOrWhiteSpace(auditLog.Action))
                    return Task.FromResult(false);

                // Tablo adı belirtilmiş mi
                if (string.IsNullOrWhiteSpace(auditLog.TableName))
                    return Task.FromResult(false);

                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı doğrulaması yapılırken hata");
                return Task.FromResult(false);
            }
        }

        // İstatistikler
        public async Task<Dictionary<string, int>> GetAuditLogsByActionDistributionAsync()
        {
            try
            {
                var allLogs = await _auditLogRepository.GetAllAuditLogsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var log in allLogs)
                {
                    var action = log.Action ?? "Unknown";
                    if (distribution.ContainsKey(action))
                        distribution[action]++;
                    else
                        distribution[action] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı eylem dağılımı hesaplanırken hata");
                throw new Exception("Denetim kaydı eylem dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetAuditLogsByTableDistributionAsync()
        {
            try
            {
                var allLogs = await _auditLogRepository.GetAllAuditLogsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var log in allLogs)
                {
                    var tableName = log.TableName ?? "Unknown";
                    if (distribution.ContainsKey(tableName))
                        distribution[tableName]++;
                    else
                        distribution[tableName] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı tablo dağılımı hesaplanırken hata");
                throw new Exception("Denetim kaydı tablo dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetAuditLogsByUserDistributionAsync()
        {
            try
            {
                var allLogs = await _auditLogRepository.GetAllAuditLogsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var log in allLogs)
                {
                    var userId = log.UserId.ToString();

                    if (distribution.ContainsKey(userId))
                        distribution[userId]++;
                    else
                        distribution[userId] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı kullanıcı dağılımı hesaplanırken hata");
                throw new Exception("Denetim kaydı kullanıcı dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByDateAsync(DateTime date)
        {
            try
            {
                var startDate = date.Date;
                var endDate = startDate.AddDays(1);

                return await GetAuditLogsByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih denetim kayıtları getirilirken hata: {Date}", date);
                throw new Exception("Tarih denetim kayıtları getirilemedi");
            }
        }
    }
}
