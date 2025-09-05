using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly ISaleService _saleService;
        private readonly ILogger<SalesController> _logger;

        public SalesController(ISaleService saleService, ILogger<SalesController> logger)
        {
            _saleService = saleService;
            _logger = logger;
        }

        // GET: api/Sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
        {
            try
            {
                var sales = await _saleService.GetAllSalesAsync();
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satışlar getirilirken hata oluştu");
                return StatusCode(500, "Satışlar getirilemedi");
            }
        }

        // GET: api/Sales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> GetSale(int id)
        {
            try
            {
                var sale = await _saleService.GetSaleByIdAsync(id);
                if (sale == null)
                    return NotFound($"ID: {id} olan satış bulunamadı");

                return Ok(sale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış ID: {SaleId} getirilirken hata oluştu", id);
                return StatusCode(500, "Satış getirilemedi");
            }
        }

        // GET: api/Sales/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSalesByProduct(int productId)
        {
            try
            {
                var sales = await _saleService.GetSalesByProductAsync(productId);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün satışları getirilirken hata: {ProductId}", productId);
                return StatusCode(500, "Ürün satışları getirilemedi");
            }
        }

        // GET: api/Sales/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSalesByUser(int userId)
        {
            try
            {
                var sales = await _saleService.GetSalesByUserAsync(userId);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı satışları getirilirken hata: {UserId}", userId);
                return StatusCode(500, "Kullanıcı satışları getirilemedi");
            }
        }

        // GET: api/Sales/status/completed
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSalesByStatus(string status)
        {
            try
            {
                var sales = await _saleService.GetSalesByStatusAsync(status);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Durum satışları getirilirken hata: {Status}", status);
                return StatusCode(500, "Durum satışları getirilemedi");
            }
        }

        // GET: api/Sales/payment-method/cash
        [HttpGet("payment-method/{paymentMethod}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSalesByPaymentMethod(string paymentMethod)
        {
            try
            {
                var sales = await _saleService.GetSalesByPaymentMethodAsync(paymentMethod);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ödeme yöntemi satışları getirilirken hata: {PaymentMethod}", paymentMethod);
                return StatusCode(500, "Ödeme yöntemi satışları getirilemedi");
            }
        }

        // GET: api/Sales/date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSalesByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var sales = await _saleService.GetSalesByDateRangeAsync(startDate, endDate);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı satışları getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı satışları getirilemedi");
            }
        }

        // GET: api/Sales/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetSalesCount()
        {
            try
            {
                var count = await _saleService.GetTotalSalesCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış sayısı getirilirken hata oluştu");
                return StatusCode(500, "Satış sayısı getirilemedi");
            }
        }

        // GET: api/Sales/total-amount
        [HttpGet("total-amount")]
        public async Task<ActionResult<decimal>> GetTotalSalesAmount()
        {
            try
            {
                var totalAmount = await _saleService.GetTotalSalesAmountAsync();
                return Ok(totalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satış tutarı getirilirken hata oluştu");
                return StatusCode(500, "Toplam satış tutarı getirilemedi");
            }
        }

        // GET: api/Sales/top-selling/10
        [HttpGet("top-selling/{count}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetTopSellingProducts(int count)
        {
            try
            {
                var sales = await _saleService.GetTopSellingProductsAsync(count);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok satan ürünler getirilirken hata: {Count}", count);
                return StatusCode(500, "En çok satan ürünler getirilemedi");
            }
        }

        // GET: api/Sales/recent/10
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetRecentSales(int count)
        {
            try
            {
                var sales = await _saleService.GetRecentSalesAsync(count);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son satışlar getirilirken hata: {Count}", count);
                return StatusCode(500, "Son satışlar getirilemedi");
            }
        }

        // POST: api/Sales
        [HttpPost]
        public async Task<ActionResult<Sale>> CreateSale(Sale sale)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdSale = await _saleService.CreateSaleAsync(sale);
                return CreatedAtAction(nameof(GetSale), new { id = createdSale.Id }, createdSale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış oluşturulurken hata: {ProductId}", sale.ProductId);
                return StatusCode(500, "Satış oluşturulamadı");
            }
        }

        // PUT: api/Sales/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSale(int id, Sale sale)
        {
            try
            {
                if (id != sale.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedSale = await _saleService.UpdateSaleAsync(sale);
                return Ok(updatedSale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış güncellenirken hata: {SaleId}", id);
                return StatusCode(500, "Satış güncellenemedi");
            }
        }

        // DELETE: api/Sales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            try
            {
                var result = await _saleService.DeleteSaleAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan satış bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış silinirken hata: {SaleId}", id);
                return StatusCode(500, "Satış silinemedi");
            }
        }

        // POST: api/Sales/process
        [HttpPost("process")]
        public async Task<ActionResult<Sale>> ProcessSale(Sale sale)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var processedSale = await _saleService.ProcessSaleAsync(sale);
                return CreatedAtAction(nameof(GetSale), new { id = processedSale.Id }, processedSale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış işlenirken hata: {ProductId}", sale.ProductId);
                return StatusCode(500, "Satış işlenemedi");
            }
        }

        // PUT: api/Sales/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateSaleStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var result = await _saleService.UpdateSaleStatusAsync(id, request.Status);
                if (!result)
                    return NotFound($"ID: {id} olan satış bulunamadı");

                return Ok("Satış durumu güncellendi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış durumu güncellenirken hata: {SaleId} - {Status}", id, request.Status);
                return StatusCode(500, "Satış durumu güncellenemedi");
            }
        }

        // GET: api/Sales/statistics/average-amount
        [HttpGet("statistics/average-amount")]
        public async Task<ActionResult<decimal>> GetAverageSaleAmount()
        {
            try
            {
                var averageAmount = await _saleService.GetAverageSaleAmountAsync();
                return Ok(averageAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama satış tutarı getirilirken hata oluştu");
                return StatusCode(500, "Ortalama satış tutarı getirilemedi");
            }
        }

        // GET: api/Sales/statistics/total-items-sold
        [HttpGet("statistics/total-items-sold")]
        public async Task<ActionResult<int>> GetTotalItemsSold()
        {
            try
            {
                var totalItems = await _saleService.GetTotalItemsSoldAsync();
                return Ok(totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satılan ürün sayısı getirilirken hata oluştu");
                return StatusCode(500, "Toplam satılan ürün sayısı getirilemedi");
            }
        }

        // GET: api/Sales/statistics/status-distribution
        [HttpGet("statistics/status-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStatusDistribution()
        {
            try
            {
                var distribution = await _saleService.GetSalesStatusDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış durumu dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Satış durumu dağılımı getirilemedi");
            }
        }

        // GET: api/Sales/statistics/payment-method-distribution
        [HttpGet("statistics/payment-method-distribution")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetPaymentMethodDistribution()
        {
            try
            {
                var distribution = await _saleService.GetSalesByPaymentMethodDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ödeme yöntemi dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Ödeme yöntemi dağılımı getirilemedi");
            }
        }

        // GET: api/Sales/statistics/date-range-amount?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("statistics/date-range-amount")]
        public async Task<ActionResult<decimal>> GetSalesAmountByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var amount = await _saleService.GetSalesAmountByDateRangeAsync(startDate, endDate);
                return Ok(amount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı satış tutarı getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı satış tutarı getirilemedi");
            }
        }
    }


}
