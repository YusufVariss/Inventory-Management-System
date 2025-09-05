using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly GoStockDbContext _context;

        public AuditLogRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync()
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<AuditLog?> GetAuditLogByIdAsync(int id)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .FirstOrDefaultAsync(al => al.Id == id);
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(int userId)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.UserId == userId)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByActionAsync(string action)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.Action == action)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByEntityAsync(string entityName)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.EntityName == entityName)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.Timestamp >= startDate && al.Timestamp <= endDate)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByEntityIdAsync(string entityName, int entityId)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.EntityName == entityName && al.EntityId == entityId)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<AuditLog> CreateAuditLogAsync(AuditLog auditLog)
        {
            auditLog.Timestamp = DateTime.Now;
            
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
            
            return auditLog;
        }

        public async Task<bool> DeleteAuditLogAsync(int id)
        {
            var auditLog = await _context.AuditLogs.FindAsync(id);
            if (auditLog == null)
                return false;

            _context.AuditLogs.Remove(auditLog);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> AuditLogExistsAsync(int id)
        {
            return await _context.AuditLogs.AnyAsync(al => al.Id == id);
        }

        public async Task<int> GetTotalAuditLogsCountAsync()
        {
            return await _context.AuditLogs.CountAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsWithPaginationAsync(int page, int pageSize)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .OrderByDescending(al => al.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetRecentAuditLogsAsync(int count)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .OrderByDescending(al => al.Timestamp)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsBySeverityAsync(string severity)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.Severity == severity)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetUserActivityLogsAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.UserId == userId && al.Timestamp >= startDate && al.Timestamp <= endDate)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<int> GetAuditLogsCountByActionAsync(string action)
        {
            return await _context.AuditLogs
                .CountAsync(al => al.Action == action);
        }

        public async Task<int> GetAuditLogsCountByEntityAsync(string entityName)
        {
            return await _context.AuditLogs
                .CountAsync(al => al.EntityName == entityName);
        }

        public async Task<AuditLog> UpdateAuditLogAsync(AuditLog auditLog)
        {
            auditLog.UpdatedAt = DateTime.Now;
            _context.AuditLogs.Update(auditLog);
            await _context.SaveChangesAsync();
            return auditLog;
        }

        public async Task<int> GetAuditLogsCountByUserAsync(int userId)
        {
            return await _context.AuditLogs
                .CountAsync(al => al.UserId == userId);
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByTableAsync(string tableName)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.TableName == tableName)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }
    }
}
