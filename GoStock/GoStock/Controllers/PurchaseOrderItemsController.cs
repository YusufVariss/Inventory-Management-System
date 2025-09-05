using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderItemsController : ControllerBase
    {
        private readonly IPurchaseOrderItemService _purchaseOrderItemService;
        private readonly ILogger<PurchaseOrderItemsController> _logger;

        public PurchaseOrderItemsController(IPurchaseOrderItemService purchaseOrderItemService, ILogger<PurchaseOrderItemsController> logger)
        {
            _purchaseOrderItemService = purchaseOrderItemService;
            _logger = logger;
        }

        // GET: api/PurchaseOrderItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItem>>> GetPurchaseOrderItems()
        {
            try
            {
                var items = await _purchaseOrderItemService.GetAllPurchaseOrderItemsAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemleri getirilirken hata oluştu");
                return StatusCode(500, "Sipariş kalemleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderItem>> GetPurchaseOrderItem(int id)
        {
            try
            {
                var item = await _purchaseOrderItemService.GetPurchaseOrderItemByIdAsync(id);
                if (item == null)
                    return NotFound($"ID: {id} olan sipariş kalemi bulunamadı");

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi ID: {ItemId} getirilirken hata oluştu", id);
                return StatusCode(500, "Sipariş kalemi getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/order/5
        [HttpGet("order/{purchaseOrderId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItem>>> GetItemsByPurchaseOrder(int purchaseOrderId)
        {
            try
            {
                var items = await _purchaseOrderItemService.GetItemsByPurchaseOrderAsync(purchaseOrderId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemleri getirilirken hata: {PurchaseOrderId}", purchaseOrderId);
                return StatusCode(500, "Sipariş kalemleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItem>>> GetItemsByProduct(int productId)
        {
            try
            {
                var items = await _purchaseOrderItemService.GetItemsByProductAsync(productId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün sipariş kalemleri getirilirken hata: {ProductId}", productId);
                return StatusCode(500, "Ürün sipariş kalemleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/supplier/5
        [HttpGet("supplier/{supplierId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItem>>> GetItemsBySupplier(int supplierId)
        {
            try
            {
                var items = await _purchaseOrderItemService.GetItemsBySupplierAsync(supplierId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi sipariş kalemleri getirilirken hata: {SupplierId}", supplierId);
                return StatusCode(500, "Tedarikçi sipariş kalemleri getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetItemsCount()
        {
            try
            {
                var count = await _purchaseOrderItemService.GetTotalItemsCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi sayısı getirilirken hata oluştu");
                return StatusCode(500, "Sipariş kalemi sayısı getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/total-value
        [HttpGet("total-value")]
        public async Task<ActionResult<decimal>> GetTotalItemsValue()
        {
            try
            {
                var totalValue = await _purchaseOrderItemService.GetTotalItemsValueAsync();
                return Ok(totalValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam sipariş kalemi değeri getirilirken hata oluştu");
                return StatusCode(500, "Toplam sipariş kalemi değeri getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/order/5/count
        [HttpGet("order/{purchaseOrderId}/count")]
        public async Task<ActionResult<int>> GetItemsCountByPurchaseOrder(int purchaseOrderId)
        {
            try
            {
                var count = await _purchaseOrderItemService.GetItemsCountByPurchaseOrderAsync(purchaseOrderId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi sayısı getirilirken hata: {PurchaseOrderId}", purchaseOrderId);
                return StatusCode(500, "Sipariş kalemi sayısı getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/top-ordered/10
        [HttpGet("top-ordered/{count}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItem>>> GetTopOrderedProducts(int count)
        {
            try
            {
                var items = await _purchaseOrderItemService.GetTopOrderedProductsAsync(count);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok sipariş edilen ürünler getirilirken hata: {Count}", count);
                return StatusCode(500, "En çok sipariş edilen ürünler getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/recent/10
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderItem>>> GetRecentItems(int count)
        {
            try
            {
                var items = await _purchaseOrderItemService.GetRecentItemsAsync(count);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son sipariş kalemleri getirilirken hata: {Count}", count);
                return StatusCode(500, "Son sipariş kalemleri getirilemedi");
            }
        }

        // POST: api/PurchaseOrderItems
        [HttpPost]
        public async Task<ActionResult<PurchaseOrderItem>> CreatePurchaseOrderItem(PurchaseOrderItem item)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdItem = await _purchaseOrderItemService.CreatePurchaseOrderItemAsync(item);
                return CreatedAtAction(nameof(GetPurchaseOrderItem), new { id = createdItem.Id }, createdItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi oluşturulurken hata: {ProductId}", item.ProductId);
                return StatusCode(500, "Sipariş kalemi oluşturulamadı");
            }
        }

        // PUT: api/PurchaseOrderItems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePurchaseOrderItem(int id, PurchaseOrderItem item)
        {
            try
            {
                if (id != item.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedItem = await _purchaseOrderItemService.UpdatePurchaseOrderItemAsync(item);
                return Ok(updatedItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi güncellenirken hata: {ItemId}", id);
                return StatusCode(500, "Sipariş kalemi güncellenemedi");
            }
        }

        // DELETE: api/PurchaseOrderItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchaseOrderItem(int id)
        {
            try
            {
                var result = await _purchaseOrderItemService.DeletePurchaseOrderItemAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan sipariş kalemi bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi silinirken hata: {ItemId}", id);
                return StatusCode(500, "Sipariş kalemi silinemedi");
            }
        }

        // POST: api/PurchaseOrderItems/process
        [HttpPost("process")]
        public async Task<ActionResult<PurchaseOrderItem>> ProcessPurchaseOrderItem(PurchaseOrderItem item)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var processedItem = await _purchaseOrderItemService.ProcessPurchaseOrderItemAsync(item);
                return CreatedAtAction(nameof(GetPurchaseOrderItem), new { id = processedItem.Id }, processedItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi işlenirken hata: {ProductId}", item.ProductId);
                return StatusCode(500, "Sipariş kalemi işlenemedi");
            }
        }

        // POST: api/PurchaseOrderItems/calculate-total
        [HttpPost("calculate-total")]
        public async Task<ActionResult<decimal>> CalculateItemTotal(CalculateTotalRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var total = await _purchaseOrderItemService.CalculateItemTotalAsync(request.Quantity, request.UnitPrice);
                return Ok(total);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi toplam tutarı hesaplanırken hata: {Quantity} - {UnitPrice}", request.Quantity, request.UnitPrice);
                return StatusCode(500, "Sipariş kalemi toplam tutarı hesaplanamadı");
            }
        }

        // GET: api/PurchaseOrderItems/statistics/average-price
        [HttpGet("statistics/average-price")]
        public async Task<ActionResult<decimal>> GetAverageItemPrice()
        {
            try
            {
                var averagePrice = await _purchaseOrderItemService.GetAverageItemPriceAsync();
                return Ok(averagePrice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama sipariş kalemi fiyatı getirilirken hata oluştu");
                return StatusCode(500, "Ortalama sipariş kalemi fiyatı getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/statistics/product-distribution
        [HttpGet("statistics/product-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetProductDistribution()
        {
            try
            {
                var distribution = await _purchaseOrderItemService.GetItemsByProductDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Ürün dağılımı getirilemedi");
            }
        }

        // GET: api/PurchaseOrderItems/statistics/supplier-distribution
        [HttpGet("statistics/supplier-distribution")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetSupplierDistribution()
        {
            try
            {
                var distribution = await _purchaseOrderItemService.GetItemsBySupplierDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Tedarikçi dağılımı getirilemedi");
            }
        }
    }

    public class CalculateTotalRequest
    {
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
