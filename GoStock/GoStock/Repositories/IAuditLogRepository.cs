using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IAuditLogRepository
    {
        Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync();
        Task<AuditLog?> GetAuditLogByIdAsync(int id);
        Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(int userId);
        Task<IEnumerable<AuditLog>> GetAuditLogsByActionAsync(string action);
        Task<IEnumerable<AuditLog>> GetAuditLogsByEntityAsync(string entityName);
        Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<AuditLog>> GetAuditLogsByEntityIdAsync(string entityName, int entityId);
        Task<AuditLog> CreateAuditLogAsync(AuditLog auditLog);
        Task<bool> DeleteAuditLogAsync(int id);
        Task<bool> AuditLogExistsAsync(int id);
        Task<int> GetTotalAuditLogsCountAsync();
        Task<IEnumerable<AuditLog>> GetAuditLogsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<AuditLog>> GetRecentAuditLogsAsync(int count);
        Task<IEnumerable<AuditLog>> GetAuditLogsBySeverityAsync(string severity);
        Task<IEnumerable<AuditLog>> GetUserActivityLogsAsync(int userId, DateTime startDate, DateTime endDate);
        Task<int> GetAuditLogsCountByActionAsync(string action);
        Task<int> GetAuditLogsCountByEntityAsync(string entityName);
        Task<AuditLog> UpdateAuditLogAsync(AuditLog auditLog);
        Task<int> GetAuditLogsCountByUserAsync(int userId);
        Task<IEnumerable<AuditLog>> GetAuditLogsByTableAsync(string tableName);
    }
}
