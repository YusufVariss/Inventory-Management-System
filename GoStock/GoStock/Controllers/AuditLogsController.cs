using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<AuditLogsController> _logger;

        public AuditLogsController(IAuditLogService auditLogService, ILogger<AuditLogsController> logger)
        {
            _auditLogService = auditLogService;
            _logger = logger;
        }

        // GET: api/AuditLogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs()
        {
            try
            {
                var auditLogs = await _auditLogService.GetAllAuditLogsAsync();
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kayıtları getirilirken hata oluştu");
                return StatusCode(500, "Denetim kayıtları getirilemedi");
            }
        }

        // GET: api/AuditLogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AuditLog>> GetAuditLog(int id)
        {
            try
            {
                var auditLog = await _auditLogService.GetAuditLogByIdAsync(id);
                if (auditLog == null)
                    return NotFound($"ID: {id} olan denetim kaydı bulunamadı");

                return Ok(auditLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı ID: {AuditLogId} getirilirken hata oluştu", id);
                return StatusCode(500, "Denetim kaydı getirilemedi");
            }
        }

        // GET: api/AuditLogs/recent/10
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetRecentAuditLogs(int count)
        {
            try
            {
                var auditLogs = await _auditLogService.GetRecentAuditLogsAsync(count);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son denetim kayıtları getirilirken hata: {Count}", count);
                return StatusCode(500, "Son denetim kayıtları getirilemedi");
            }
        }

        // GET: api/AuditLogs/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByUser(int userId)
        {
            try
            {
                var auditLogs = await _auditLogService.GetAuditLogsByUserAsync(userId);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı denetim kayıtları getirilirken hata: {UserId}", userId);
                return StatusCode(500, "Kullanıcı denetim kayıtları getirilemedi");
            }
        }

        // GET: api/AuditLogs/action/LOGIN
        [HttpGet("action/{action}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByAction(string action)
        {
            try
            {
                var auditLogs = await _auditLogService.GetAuditLogsByActionAsync(action);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eylem denetim kayıtları getirilirken hata: {Action}", action);
                return StatusCode(500, "Eylem denetim kayıtları getirilemedi");
            }
        }

        // GET: api/AuditLogs/table/Users
        [HttpGet("table/{tableName}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByTable(string tableName)
        {
            try
            {
                var auditLogs = await _auditLogService.GetAuditLogsByTableAsync(tableName);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tablo denetim kayıtları getirilirken hata: {TableName}", tableName);
                return StatusCode(500, "Tablo denetim kayıtları getirilemedi");
            }
        }

        // GET: api/AuditLogs/date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var auditLogs = await _auditLogService.GetAuditLogsByDateRangeAsync(startDate, endDate);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı denetim kayıtları getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı denetim kayıtları getirilemedi");
            }
        }

        // POST: api/AuditLogs
        [HttpPost]
        public async Task<ActionResult<AuditLog>> CreateAuditLog(AuditLog auditLog)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdAuditLog = await _auditLogService.CreateAuditLogAsync(auditLog);
                return CreatedAtAction(nameof(GetAuditLog), new { id = createdAuditLog.Id }, createdAuditLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı oluşturulurken hata");
                return StatusCode(500, "Denetim kaydı oluşturulamadı");
            }
        }

        // GET: api/AuditLogs/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetAuditLogsCount()
        {
            try
            {
                var count = await _auditLogService.GetTotalAuditLogsCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Denetim kaydı sayısı getirilirken hata");
                return StatusCode(500, "Denetim kaydı sayısı getirilemedi");
            }
        }

        // GET: api/AuditLogs/statistics/action-distribution
        [HttpGet("statistics/action-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetActionDistribution()
        {
            try
            {
                var distribution = await _auditLogService.GetAuditLogsByActionDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eylem dağılımı getirilirken hata");
                return StatusCode(500, "Eylem dağılımı getirilemedi");
            }
        }

        // GET: api/AuditLogs/statistics/table-distribution
        [HttpGet("statistics/table-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetTableDistribution()
        {
            try
            {
                var distribution = await _auditLogService.GetAuditLogsByTableDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tablo dağılımı getirilirken hata");
                return StatusCode(500, "Tablo dağılımı getirilemedi");
            }
        }

        // GET: api/AuditLogs/statistics/user-distribution
        [HttpGet("statistics/user-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetUserDistribution()
        {
            try
            {
                var distribution = await _auditLogService.GetAuditLogsByUserDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı dağılımı getirilirken hata");
                return StatusCode(500, "Kullanıcı dağılımı getirilemedi");
            }
        }
    }
}
