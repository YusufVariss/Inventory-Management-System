using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReturnsController : ControllerBase
    {
        private readonly IReturnService _returnService;
        private readonly ILogger<ReturnsController> _logger;

        public ReturnsController(IReturnService returnService, ILogger<ReturnsController> logger)
        {
            _returnService = returnService;
            _logger = logger;
        }

        // GET: api/Returns
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturns()
        {
            try
            {
                var returns = await _returnService.GetAllReturnsAsync();
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İadeler getirilirken hata oluştu");
                return StatusCode(500, "İadeler getirilemedi");
            }
        }

        // GET: api/Returns/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Return>> GetReturn(int id)
        {
            try
            {
                var returnItem = await _returnService.GetReturnByIdAsync(id);
                if (returnItem == null)
                    return NotFound($"ID: {id} olan iade bulunamadı");

                return Ok(returnItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade ID: {ReturnId} getirilirken hata oluştu", id);
                return StatusCode(500, "İade getirilemedi");
            }
        }

        // GET: api/Returns/sale/5
        [HttpGet("sale/{saleId}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturnsBySale(int saleId)
        {
            try
            {
                var returns = await _returnService.GetReturnsBySaleAsync(saleId);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış iadeleri getirilirken hata: {SaleId}", saleId);
                return StatusCode(500, "Satış iadeleri getirilemedi");
            }
        }

        // GET: api/Returns/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturnsByProduct(int productId)
        {
            try
            {
                var returns = await _returnService.GetReturnsByProductAsync(productId);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün iadeleri getirilirken hata: {ProductId}", productId);
                return StatusCode(500, "Ürün iadeleri getirilemedi");
            }
        }

        // GET: api/Returns/user/{userFullName}
        [HttpGet("user/{userFullName}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturnsByUser(string userFullName)
        {
            try
            {
                var returns = await _returnService.GetReturnsByUserAsync(userFullName);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı iadeleri getirilirken hata: {UserFullName}", userFullName);
                return StatusCode(500, "Kullanıcı iadeleri getirilemedi");
            }
        }

        // GET: api/Returns/status/pending
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturnsByStatus(string status)
        {
            try
            {
                var returns = await _returnService.GetReturnsByStatusAsync(status);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Durum iadeleri getirilirken hata: {Status}", status);
                return StatusCode(500, "Durum iadeleri getirilemedi");
            }
        }

        // GET: api/Returns/reason/defective
        [HttpGet("reason/{reason}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturnsByReason(string reason)
        {
            try
            {
                var returns = await _returnService.GetReturnsByReasonAsync(reason);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Neden iadeleri getirilirken hata: {Reason}", reason);
                return StatusCode(500, "Neden iadeleri getirilemedi");
            }
        }

        // GET: api/Returns/date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<Return>>> GetReturnsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var returns = await _returnService.GetReturnsByDateRangeAsync(startDate, endDate);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı iadeleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı iadeleri getirilemedi");
            }
        }

        // GET: api/Returns/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetReturnsCount()
        {
            try
            {
                var count = await _returnService.GetTotalReturnsCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade sayısı getirilirken hata oluştu");
                return StatusCode(500, "İade sayısı getirilemedi");
            }
        }

        // GET: api/Returns/total-amount
        [HttpGet("total-amount")]
        public async Task<ActionResult<decimal>> GetTotalReturnsAmount()
        {
            try
            {
                var totalAmount = await _returnService.GetTotalReturnsAmountAsync();
                return Ok(totalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam iade tutarı getirilirken hata oluştu");
                return StatusCode(500, "Toplam iade tutarı getirilemedi");
            }
        }

        // GET: api/Returns/top-returned/10
        [HttpGet("top-returned/{count}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetTopReturnedProducts(int count)
        {
            try
            {
                var returns = await _returnService.GetTopReturnedProductsAsync(count);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok iade edilen ürünler getirilirken hata: {Count}", count);
                return StatusCode(500, "En çok iade edilen ürünler getirilemedi");
            }
        }

        // GET: api/Returns/recent/10
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<IEnumerable<Return>>> GetRecentReturns(int count)
        {
            try
            {
                var returns = await _returnService.GetRecentReturnsAsync(count);
                return Ok(returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son iadeler getirilirken hata: {Count}", count);
                return StatusCode(500, "Son iadeler getirilemedi");
            }
        }

        // POST: api/Returns
        [HttpPost]
        public async Task<ActionResult<Return>> CreateReturn(Return returnItem)
        {
            try
            {
                _logger.LogInformation("İade oluşturuluyor - ProductName: {ProductName}, Quantity: {Quantity}", 
                    returnItem.ProductName, returnItem.Quantity);

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Model validation failed: {ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var createdReturn = await _returnService.CreateReturnAsync(returnItem);
                _logger.LogInformation("İade başarıyla oluşturuldu - ID: {Id}, ProductName: {ProductName}", 
                    createdReturn.Id, createdReturn.ProductName);
                return CreatedAtAction(nameof(GetReturn), new { id = createdReturn.Id }, createdReturn);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade oluşturulurken hata: {ProductName}", returnItem.ProductName);
                return StatusCode(500, "İade oluşturulamadı");
            }
        }

        // PUT: api/Returns/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReturn(int id, Return returnItem)
        {
            try
            {
                if (id != returnItem.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Model validation failed: {ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                // Zorunlu alanları kontrol et
                if (string.IsNullOrWhiteSpace(returnItem.ProductName))
                    return BadRequest("Ürün adı zorunludur");

                if (returnItem.Quantity <= 0)
                    return BadRequest("Miktar 0'dan büyük olmalıdır");

                if (string.IsNullOrWhiteSpace(returnItem.Reason))
                    return BadRequest("İade nedeni zorunludur");

                var updatedReturn = await _returnService.UpdateReturnAsync(returnItem);
                return Ok(updatedReturn);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade güncellenirken hata: {ReturnId}", id);
                return StatusCode(500, "İade güncellenemedi");
            }
        }

        // DELETE: api/Returns/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReturn(int id)
        {
            try
            {
                var result = await _returnService.DeleteReturnAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan iade bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade silinirken hata: {ReturnId}", id);
                return StatusCode(500, "İade silinemedi");
            }
        }

        // POST: api/Returns/process
        [HttpPost("process")]
        public async Task<ActionResult<Return>> ProcessReturn(Return returnItem)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var processedReturn = await _returnService.ProcessReturnAsync(returnItem);
                return CreatedAtAction(nameof(GetReturn), new { id = processedReturn.Id }, processedReturn);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade işlenirken hata: {ProductName}", returnItem.ProductName);
                return StatusCode(500, "İade işlenemedi");
            }
        }

        // PUT: api/Returns/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateReturnStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var result = await _returnService.UpdateReturnStatusAsync(id, request.Status);
                if (!result)
                    return NotFound($"ID: {id} olan iade bulunamadı");

                return Ok("İade durumu güncellendi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade durumu güncellenirken hata: {ReturnId} - {Status}", id, request.Status);
                return StatusCode(500, "İade durumu güncellenemedi");
            }
        }

        // PUT: api/Returns/5/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveReturn(int id)
        {
            try
            {
                var result = await _returnService.ApproveReturnAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan iade bulunamadı veya onaylanamadı");

                return Ok("İade başarıyla onaylandı");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade onaylanırken hata: {ReturnId}", id);
                return StatusCode(500, "İade onaylanamadı");
            }
        }

        // PUT: api/Returns/5/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectReturn(int id)
        {
            try
            {
                var result = await _returnService.RejectReturnAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan iade bulunamadı veya reddedilemedi");

                return Ok("İade başarıyla reddedildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade reddedilirken hata: {ReturnId}", id);
                return StatusCode(500, "İade reddedilemedi");
            }
        }

        // GET: api/Returns/statistics/average-amount
        [HttpGet("statistics/average-amount")]
        public async Task<ActionResult<decimal>> GetAverageReturnAmount()
        {
            try
            {
                var averageAmount = await _returnService.GetAverageReturnAmountAsync();
                return Ok(averageAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama iade tutarı getirilirken hata oluştu");
                return StatusCode(500, "Ortalama iade tutarı getirilemedi");
            }
        }

        // GET: api/Returns/statistics/total-items-returned
        [HttpGet("statistics/total-items-returned")]
        public async Task<ActionResult<int>> GetTotalItemsReturned()
        {
            try
            {
                var totalItems = await _returnService.GetTotalItemsReturnedAsync();
                return Ok(totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam iade edilen ürün sayısı getirilirken hata oluştu");
                return StatusCode(500, "Toplam iade edilen ürün sayısı getirilemedi");
            }
        }

        // GET: api/Returns/statistics/status-distribution
        [HttpGet("statistics/status-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStatusDistribution()
        {
            try
            {
                var distribution = await _returnService.GetReturnsStatusDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade durumu dağılımı getirilirken hata oluştu");
                return StatusCode(500, "İade durumu dağılımı getirilemedi");
            }
        }

        // GET: api/Returns/statistics/reason-distribution
        [HttpGet("statistics/reason-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetReasonDistribution()
        {
            try
            {
                var distribution = await _returnService.GetReturnsByReasonDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade neden dağılımı getirilirken hata oluştu");
                return StatusCode(500, "İade neden dağılımı getirilemedi");
            }
        }

        // GET: api/Returns/statistics/date-range-amount?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("statistics/date-range-amount")]
        public async Task<ActionResult<decimal>> GetReturnsAmountByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var amount = await _returnService.GetReturnsAmountByDateRangeAsync(startDate, endDate);
                return Ok(amount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı iade tutarı getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı iade tutarı getirilemedi");
            }
        }
    }


}
