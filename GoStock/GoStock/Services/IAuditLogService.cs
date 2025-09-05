using GoStock.Models;

namespace GoStock.Services
{
    public interface IAuditLogService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync();
        Task<AuditLog?> GetAuditLogByIdAsync(int id);
        Task<AuditLog> CreateAuditLogAsync(AuditLog auditLog);
        Task<AuditLog> UpdateAuditLogAsync(AuditLog auditLog);
        Task<bool> DeleteAuditLogAsync(int id);
        
        // Denetim kaydı yönetimi
        Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(int userId);
        Task<IEnumerable<AuditLog>> GetAuditLogsByActionAsync(string action);
        Task<IEnumerable<AuditLog>> GetAuditLogsByTableAsync(string tableName);
        Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<AuditLog>> GetAuditLogsByEntityIdAsync(string entityName, int entityId);
        
        // Denetim kaydı kontrolü
        Task<bool> AuditLogExistsAsync(int id);
        Task<int> GetTotalAuditLogsCountAsync();
        Task<int> GetAuditLogsCountByUserAsync(int userId);
        Task<int> GetAuditLogsCountByActionAsync(string action);
        
        // Arama ve filtreleme
        Task<IEnumerable<AuditLog>> GetAuditLogsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<AuditLog>> GetRecentAuditLogsAsync(int count);
        
        // İş mantığı
        Task<AuditLog> LogUserActionAsync(int userId, string action, string tableName, int? entityId = null, string? details = null);
        Task<AuditLog> LogDataChangeAsync(int userId, string action, string tableName, int entityId, string oldValues, string newValues);
        Task<bool> ValidateAuditLogAsync(AuditLog auditLog);
        
        // İstatistikler
        Task<Dictionary<string, int>> GetAuditLogsByActionDistributionAsync();
        Task<Dictionary<string, int>> GetAuditLogsByTableDistributionAsync();
        Task<Dictionary<string, int>> GetAuditLogsByUserDistributionAsync();
        Task<IEnumerable<AuditLog>> GetAuditLogsByDateAsync(DateTime date);
    }
}
