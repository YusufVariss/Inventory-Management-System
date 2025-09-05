using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;
        private readonly ILogger<PurchaseOrdersController> _logger;

        public PurchaseOrdersController(IPurchaseOrderService purchaseOrderService, ILogger<PurchaseOrdersController> logger)
        {
            _purchaseOrderService = purchaseOrderService;
            _logger = logger;
        }

        // GET: api/PurchaseOrders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetPurchaseOrders()
        {
            try
            {
                var orders = await _purchaseOrderService.GetAllPurchaseOrdersAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişleri getirilirken hata oluştu");
                return StatusCode(500, "Satın alma siparişleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrder>> GetPurchaseOrder(int id)
        {
            try
            {
                var order = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
                if (order == null)
                    return NotFound($"ID: {id} olan satın alma siparişi bulunamadı");

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi ID: {OrderId} getirilirken hata oluştu", id);
                return StatusCode(500, "Satın alma siparişi getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/supplier/5
        [HttpGet("supplier/{supplierId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetOrdersBySupplier(int supplierId)
        {
            try
            {
                var orders = await _purchaseOrderService.GetPurchaseOrdersBySupplierAsync(supplierId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi siparişleri getirilirken hata: {SupplierId}", supplierId);
                return StatusCode(500, "Tedarikçi siparişleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetOrdersByUser(int userId)
        {
            try
            {
                var orders = await _purchaseOrderService.GetPurchaseOrdersByUserAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı siparişleri getirilirken hata: {UserId}", userId);
                return StatusCode(500, "Kullanıcı siparişleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/status/pending
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetOrdersByStatus(string status)
        {
            try
            {
                var orders = await _purchaseOrderService.GetPurchaseOrdersByStatusAsync(status);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Durum siparişleri getirilirken hata: {Status}", status);
                return StatusCode(500, "Durum siparişleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/order-number/PO-2024-001
        [HttpGet("order-number/{orderNumber}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetOrdersByOrderNumber(string orderNumber)
        {
            try
            {
                var orders = await _purchaseOrderService.GetPurchaseOrdersByOrderNumberAsync(orderNumber);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş numarası siparişleri getirilirken hata: {OrderNumber}", orderNumber);
                return StatusCode(500, "Sipariş numarası siparişleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetOrdersByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var orders = await _purchaseOrderService.GetPurchaseOrdersByDateRangeAsync(startDate, endDate);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı siparişleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı siparişleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetOrdersCount()
        {
            try
            {
                var count = await _purchaseOrderService.GetTotalPurchaseOrdersCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş sayısı getirilirken hata oluştu");
                return StatusCode(500, "Sipariş sayısı getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/total-amount
        [HttpGet("total-amount")]
        public async Task<ActionResult<decimal>> GetTotalOrdersAmount()
        {
            try
            {
                var totalAmount = await _purchaseOrderService.GetTotalPurchaseOrdersAmountAsync();
                return Ok(totalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam sipariş tutarı getirilirken hata oluştu");
                return StatusCode(500, "Toplam sipariş tutarı getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/top-suppliers/10
        [HttpGet("top-suppliers/{count}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetTopSuppliersByOrders(int count)
        {
            try
            {
                var orders = await _purchaseOrderService.GetTopSuppliersByOrdersAsync(count);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok sipariş veren tedarikçiler getirilirken hata: {Count}", count);
                return StatusCode(500, "En çok sipariş veren tedarikçiler getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/recent/10
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetRecentOrders(int count)
        {
            try
            {
                var orders = await _purchaseOrderService.GetRecentPurchaseOrdersAsync(count);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son siparişler getirilirken hata: {Count}", count);
                return StatusCode(500, "Son siparişler getirilemedi");
            }
        }

        // POST: api/PurchaseOrders
        [HttpPost]
        public async Task<ActionResult<PurchaseOrder>> CreatePurchaseOrder(PurchaseOrder order)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdOrder = await _purchaseOrderService.CreatePurchaseOrderAsync(order);
                return CreatedAtAction(nameof(GetPurchaseOrder), new { id = createdOrder.Id }, createdOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi oluşturulurken hata: {OrderNumber}", order.OrderNumber);
                return StatusCode(500, "Satın alma siparişi oluşturulamadı");
            }
        }

        // PUT: api/PurchaseOrders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePurchaseOrder(int id, PurchaseOrder order)
        {
            try
            {
                if (id != order.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedOrder = await _purchaseOrderService.UpdatePurchaseOrderAsync(order);
                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi güncellenirken hata: {OrderId}", id);
                return StatusCode(500, "Satın alma siparişi güncellenemedi");
            }
        }

        // DELETE: api/PurchaseOrders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchaseOrder(int id)
        {
            try
            {
                var result = await _purchaseOrderService.DeletePurchaseOrderAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan satın alma siparişi bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi silinirken hata: {OrderId}", id);
                return StatusCode(500, "Satın alma siparişi silinemedi");
            }
        }

        // POST: api/PurchaseOrders/process
        [HttpPost("process")]
        public async Task<ActionResult<PurchaseOrder>> ProcessPurchaseOrder(PurchaseOrder order)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var processedOrder = await _purchaseOrderService.ProcessPurchaseOrderAsync(order);
                return CreatedAtAction(nameof(GetPurchaseOrder), new { id = processedOrder.Id }, processedOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi işlenirken hata: {OrderNumber}", order.OrderNumber);
                return StatusCode(500, "Satın alma siparişi işlenemedi");
            }
        }

        // PUT: api/PurchaseOrders/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var result = await _purchaseOrderService.UpdatePurchaseOrderStatusAsync(id, request.Status);
                if (!result)
                    return NotFound($"ID: {id} olan satın alma siparişi bulunamadı");

                return Ok("Sipariş durumu güncellendi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş durumu güncellenirken hata: {OrderId} - {Status}", id, request.Status);
                return StatusCode(500, "Sipariş durumu güncellenemedi");
            }
        }

        // POST: api/PurchaseOrders/5/approve
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveOrder(int id, [FromBody] ApproveOrderRequest request)
        {
            try
            {
                var result = await _purchaseOrderService.ApprovePurchaseOrderAsync(id, request.ApproverId);
                if (!result)
                    return NotFound($"ID: {id} olan satın alma siparişi bulunamadı");

                return Ok("Sipariş onaylandı");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş onaylanırken hata: {OrderId}", id);
                return StatusCode(500, "Sipariş onaylanamadı");
            }
        }

        // POST: api/PurchaseOrders/5/reject
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectOrder(int id, [FromBody] RejectOrderRequest request)
        {
            try
            {
                var result = await _purchaseOrderService.RejectPurchaseOrderAsync(id, request.RejectorId, request.Reason);
                if (!result)
                    return NotFound($"ID: {id} olan satın alma siparişi bulunamadı");

                return Ok("Sipariş reddedildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş reddedilirken hata: {OrderId}", id);
                return StatusCode(500, "Sipariş reddedilemedi");
            }
        }

        // GET: api/PurchaseOrders/statistics/average-amount
        [HttpGet("statistics/average-amount")]
        public async Task<ActionResult<decimal>> GetAverageOrderAmount()
        {
            try
            {
                var averageAmount = await _purchaseOrderService.GetAveragePurchaseOrderAmountAsync();
                return Ok(averageAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama sipariş tutarı getirilirken hata oluştu");
                return StatusCode(500, "Ortalama sipariş tutarı getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/statistics/total-items-ordered
        [HttpGet("statistics/total-items-ordered")]
        public async Task<ActionResult<int>> GetTotalItemsOrdered()
        {
            try
            {
                var totalItems = await _purchaseOrderService.GetTotalItemsOrderedAsync();
                return Ok(totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam sipariş edilen ürün sayısı getirilirken hata oluştu");
                return StatusCode(500, "Toplam sipariş edilen ürün sayısı getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/statistics/status-distribution
        [HttpGet("statistics/status-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStatusDistribution()
        {
            try
            {
                var distribution = await _purchaseOrderService.GetPurchaseOrderStatusDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş durumu dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Sipariş durumu dağılımı getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/statistics/supplier-distribution
        [HttpGet("statistics/supplier-distribution")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetSupplierDistribution()
        {
            try
            {
                var distribution = await _purchaseOrderService.GetPurchaseOrdersBySupplierDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Tedarikçi dağılımı getirilemedi");
            }
        }

        // GET: api/PurchaseOrders/statistics/date-range-amount?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("statistics/date-range-amount")]
        public async Task<ActionResult<decimal>> GetOrdersAmountByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var amount = await _purchaseOrderService.GetPurchaseOrdersAmountByDateRangeAsync(startDate, endDate);
                return Ok(amount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı sipariş tutarı getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı sipariş tutarı getirilemedi");
            }
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class ApproveOrderRequest
    {
        public int ApproverId { get; set; }
    }

    public class RejectOrderRequest
    {
        public int RejectorId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
