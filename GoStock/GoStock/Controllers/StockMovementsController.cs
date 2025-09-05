using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockMovementsController : ControllerBase
    {
        private readonly IStockMovementService _stockMovementService;
        private readonly ILogger<StockMovementsController> _logger;

        public StockMovementsController(IStockMovementService stockMovementService, ILogger<StockMovementsController> logger)
        {
            _stockMovementService = stockMovementService;
            _logger = logger;
        }

        // GET: api/StockMovements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovements()
        {
            try
            {
                var movements = await _stockMovementService.GetAllStockMovementsAsync();
                
                // Convert to DTOs with related data - include product and user information
                var movementDtos = movements.Select(m => new StockMovementDto
                {
                    Id = m.Id,
                    ProductId = m.ProductId,
                    MovementType = m.MovementType,
                    Quantity = m.Quantity,
                    PreviousStock = m.PreviousStock,
                    NewStock = m.NewStock,
                    UnitPrice = m.UnitPrice,
                    TotalAmount = m.TotalAmount,
                    Reference = m.Reference,
                    Notes = m.Notes,
                    MovementDate = m.MovementDate,
                    UserId = m.UserId,
                    Product = m.Product != null ? new ProductInfoDto
                    {
                        Id = m.Product.Id,
                        Name = m.Product.Name,
                        Description = m.Product.Description,
                        Price = m.Product.Price,
                        StockQuantity = m.Product.StockQuantity,
                        CategoryName = m.Product.Category?.Name ?? "Kategori Yok"
                    } : null,
                    User = m.User != null ? new UserInfoDto
                    {
                        Id = m.User.Id,
                        Username = m.User.Username,
                        FirstName = m.User.FullName, // FullName'i FirstName olarak kullanıyoruz
                        LastName = "", // LastName boş bırakıyoruz
                        FullName = m.User.FullName, // FullName'i doğru şekilde atıyoruz
                        Email = m.User.Email
                    } : null
                });

                return Ok(movementDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketleri getirilirken hata oluştu: {Error}", ex.Message);
                return StatusCode(500, "Stok hareketleri getirilemedi");
            }
        }

        // GET: api/StockMovements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StockMovement>> GetStockMovement(int id)
        {
            try
            {
                var movement = await _stockMovementService.GetStockMovementByIdAsync(id);
                if (movement == null)
                    return NotFound($"ID: {id} olan stok hareketi bulunamadı");

                return Ok(movement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi ID: {MovementId} getirilirken hata oluştu", id);
                return StatusCode(500, "Stok hareketi getirilemedi");
            }
        }

        // GET: api/StockMovements/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetMovementsByProduct(int productId)
        {
            try
            {
                var movements = await _stockMovementService.GetStockMovementsByProductAsync(productId);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün stok hareketleri getirilirken hata: {ProductId}", productId);
                return StatusCode(500, "Ürün stok hareketleri getirilemedi");
            }
        }

        // GET: api/StockMovements/type/in
        [HttpGet("type/{movementType}")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetMovementsByType(string movementType)
        {
            try
            {
                var movements = await _stockMovementService.GetStockMovementsByTypeAsync(movementType);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hareket türü stok hareketleri getirilirken hata: {MovementType}", movementType);
                return StatusCode(500, "Hareket türü stok hareketleri getirilemedi");
            }
        }

        // GET: api/StockMovements/date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetMovementsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var movements = await _stockMovementService.GetStockMovementsByDateRangeAsync(startDate, endDate);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı stok hareketleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı stok hareketleri getirilemedi");
            }
        }

        // GET: api/StockMovements/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetMovementsByUser(int userId)
        {
            try
            {
                var movements = await _stockMovementService.GetStockMovementsByUserAsync(userId);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı stok hareketleri getirilirken hata: {UserId}", userId);
                return StatusCode(500, "Kullanıcı stok hareketleri getirilemedi");
            }
        }

        // GET: api/StockMovements/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetMovementsCount()
        {
            try
            {
                var count = await _stockMovementService.GetTotalStockMovementsCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareket sayısı getirilirken hata oluştu");
                return StatusCode(500, "Stok hareket sayısı getirilemedi");
            }
        }

        // GET: api/StockMovements/low-stock-alerts
        [HttpGet("low-stock-alerts")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetLowStockAlerts()
        {
            try
            {
                var alerts = await _stockMovementService.GetLowStockAlertsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Düşük stok uyarıları getirilirken hata oluştu");
                return StatusCode(500, "Düşük stok uyarıları getirilemedi");
            }
        }

        // GET: api/StockMovements/recent/10
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetRecentMovements(int count)
        {
            try
            {
                var movements = await _stockMovementService.GetRecentStockMovementsAsync(count);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son stok hareketleri getirilirken hata: {Count}", count);
                return StatusCode(500, "Son stok hareketleri getirilemedi");
            }
        }

        // POST: api/StockMovements
        [HttpPost]
        public async Task<ActionResult<StockMovement>> CreateStockMovement(StockMovement movement)
        {
            try
            {
                _logger.LogInformation("Received StockMovement: {@Movement}", movement);
                
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("ModelState validation failed: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var createdMovement = await _stockMovementService.CreateStockMovementAsync(movement);
                return CreatedAtAction(nameof(GetStockMovement), new { id = createdMovement.Id }, createdMovement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi oluşturulurken hata: {ProductId}", movement.ProductId);
                return StatusCode(500, "Stok hareketi oluşturulamadı");
            }
        }

        // PUT: api/StockMovements/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStockMovement(int id, StockMovement movement)
        {
            try
            {
                if (id != movement.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedMovement = await _stockMovementService.UpdateStockMovementAsync(movement);
                return Ok(updatedMovement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi güncellenirken hata: {MovementId}", id);
                return StatusCode(500, "Stok hareketi güncellenemedi");
            }
        }

        // DELETE: api/StockMovements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStockMovement(int id)
        {
            try
            {
                var result = await _stockMovementService.DeleteStockMovementAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan stok hareketi bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi silinirken hata: {MovementId}", id);
                return StatusCode(500, "Stok hareketi silinemedi");
            }
        }

        // POST: api/StockMovements/stock-in
        [HttpPost("stock-in")]
        public async Task<ActionResult<StockMovement>> ProcessStockIn(StockInRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var movement = await _stockMovementService.ProcessStockInAsync(
                    request.ProductId, request.Quantity, request.UserId, request.UnitPrice, request.TotalAmount, request.Reference, request.Notes);
                
                return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, movement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok girişi işlenirken hata: {ProductId}", request.ProductId);
                return StatusCode(500, "Stok girişi işlenemedi");
            }
        }

        // POST: api/StockMovements/stock-out
        [HttpPost("stock-out")]
        public async Task<ActionResult<StockMovement>> ProcessStockOut(StockOutRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var movement = await _stockMovementService.ProcessStockOutAsync(
                    request.ProductId, request.Quantity, request.UserId, request.UnitPrice, request.TotalAmount, request.Reference, request.Notes);
                
                return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, movement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok çıkışı işlenirken hata: {ProductId}", request.ProductId);
                return StatusCode(500, "Stok çıkışı işlenemedi");
            }
        }

        // GET: api/StockMovements/statistics/summary
        [HttpGet("statistics/summary")]
        public async Task<ActionResult<StockMovementSummaryDto>> GetSummaryStatistics()
        {
            try
            {
                var movements = await _stockMovementService.GetAllStockMovementsWithoutNavigationAsync();
                var now = DateTime.Now;
                var currentMonth = now.Month;
                var currentYear = now.Year;

                var summary = new StockMovementSummaryDto
                {
                    TotalMovements = movements.Count(),
                    TotalIn = movements.Where(m => m.MovementType == "in").Sum(m => m.Quantity),
                    TotalOut = movements.Where(m => m.MovementType == "out").Sum(m => m.Quantity),
                    TotalValue = movements.Sum(m => m.TotalAmount ?? 0),
                    MonthlyMovements = movements.Count(m => 
                        m.MovementDate.Month == currentMonth && m.MovementDate.Year == currentYear),
                    MonthlyIn = movements.Where(m => 
                        m.MovementType == "in" && 
                        m.MovementDate.Month == currentMonth && 
                        m.MovementDate.Year == currentYear).Sum(m => m.Quantity),
                    MonthlyOut = movements.Where(m => 
                        m.MovementType == "out" && 
                        m.MovementDate.Month == currentMonth && 
                        m.MovementDate.Year == currentYear).Sum(m => m.Quantity)
                };

                summary.NetChange = summary.TotalIn - summary.TotalOut;

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Özet istatistikler getirilirken hata oluştu: {Error}", ex.Message);
                return StatusCode(500, "Özet istatistikler getirilemedi");
            }
        }

        // GET: api/StockMovements/statistics/type-distribution
        [HttpGet("statistics/type-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetTypeDistribution()
        {
            try
            {
                var distribution = await _stockMovementService.GetStockMovementTypeDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hareket türü dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Hareket türü dağılımı getirilemedi");
            }
        }

        // GET: api/StockMovements/statistics/product-distribution
        [HttpGet("statistics/product-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetProductDistribution()
        {
            try
            {
                var distribution = await _stockMovementService.GetStockMovementByProductDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Ürün dağılımı getirilemedi");
            }
        }

        // GET: api/StockMovements/statistics/total-value
        [HttpGet("statistics/total-value")]
        public async Task<ActionResult<decimal>> GetTotalStockValue()
        {
            try
            {
                var totalValue = await _stockMovementService.GetTotalStockValueAsync();
                return Ok(totalValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam stok değeri getirilirken hata oluştu");
                return StatusCode(500, "Toplam stok değeri getirilemedi");
            }
        }

        // GET: api/StockMovements/statistics/product/5/total-value
        [HttpGet("statistics/product/{productId}/total-value")]
        public async Task<ActionResult<decimal>> GetProductTotalStockValue(int productId)
        {
            try
            {
                var totalValue = await _stockMovementService.GetProductTotalStockValueAsync(productId);
                return Ok(totalValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün toplam stok değeri getirilirken hata: {ProductId}", productId);
                return StatusCode(500, "Ürün toplam stok değeri getirilemedi");
            }
        }
    }

    public class StockInRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int UserId { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
    }

    public class StockOutRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int UserId { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
    }
}
