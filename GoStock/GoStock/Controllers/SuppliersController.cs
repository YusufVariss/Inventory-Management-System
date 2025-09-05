using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly ISupplierService _supplierService;
        private readonly ILogger<SuppliersController> _logger;

        public SuppliersController(ISupplierService supplierService, ILogger<SuppliersController> logger)
        {
            _supplierService = supplierService;
            _logger = logger;
        }

        // GET: api/Suppliers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
        {
            try
            {
                var suppliers = await _supplierService.GetAllSuppliersAsync();
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçiler getirilirken hata oluştu");
                return StatusCode(500, "Tedarikçiler getirilemedi");
            }
        }

        // GET: api/Suppliers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetSupplier(int id)
        {
            try
            {
                var supplier = await _supplierService.GetSupplierByIdAsync(id);
                if (supplier == null)
                    return NotFound($"ID: {id} olan tedarikçi bulunamadı");

                return Ok(supplier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi ID: {SupplierId} getirilirken hata oluştu", id);
                return StatusCode(500, "Tedarikçi getirilemedi");
            }
        }

        // GET: api/Suppliers/name/ABC Company
        [HttpGet("name/{name}")]
        public async Task<ActionResult<Supplier>> GetSupplierByName(string name)
        {
            try
            {
                var supplier = await _supplierService.GetSupplierByNameAsync(name);
                if (supplier == null)
                    return NotFound($"Ad: {name} olan tedarikçi bulunamadı");

                return Ok(supplier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ad: {Name} tedarikçisi getirilirken hata oluştu", name);
                return StatusCode(500, "Tedarikçi getirilemedi");
            }
        }

        // GET: api/Suppliers/email/supplier@example.com
        [HttpGet("email/{email}")]
        public async Task<ActionResult<Supplier>> GetSupplierByEmail(string email)
        {
            try
            {
                var supplier = await _supplierService.GetSupplierByEmailAsync(email);
                if (supplier == null)
                    return NotFound($"E-posta: {email} olan tedarikçi bulunamadı");

                return Ok(supplier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "E-posta: {Email} tedarikçisi getirilirken hata oluştu", email);
                return StatusCode(500, "Tedarikçi getirilemedi");
            }
        }

        // GET: api/Suppliers/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Supplier>>> GetActiveSuppliers()
        {
            try
            {
                var suppliers = await _supplierService.GetActiveSuppliersAsync();
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif tedarikçiler getirilirken hata oluştu");
                return StatusCode(500, "Aktif tedarikçiler getirilemedi");
            }
        }

        // GET: api/Suppliers/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetSuppliersCount()
        {
            try
            {
                var count = await _supplierService.GetTotalSuppliersCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi sayısı getirilirken hata oluştu");
                return StatusCode(500, "Tedarikçi sayısı getirilemedi");
            }
        }

        // GET: api/Suppliers/5/products
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<Product>>> GetSupplierProducts(int id)
        {
            try
            {
                var products = await _supplierService.GetSupplierProductsAsync(id);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi ürünleri getirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi ürünleri getirilemedi");
            }
        }

        // GET: api/Suppliers/5/orders
        [HttpGet("{id}/orders")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetSupplierOrders(int id)
        {
            try
            {
                var orders = await _supplierService.GetSupplierOrdersAsync(id);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi siparişleri getirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi siparişleri getirilemedi");
            }
        }

        // POST: api/Suppliers
        [HttpPost]
        public async Task<ActionResult<Supplier>> CreateSupplier(Supplier supplier)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdSupplier = await _supplierService.CreateSupplierAsync(supplier);
                return CreatedAtAction(nameof(GetSupplier), new { id = createdSupplier.Id }, createdSupplier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi oluşturulurken hata: {Name}", supplier.Name);
                return StatusCode(500, "Tedarikçi oluşturulamadı");
            }
        }

        // PUT: api/Suppliers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, Supplier supplier)
        {
            try
            {
                if (id != supplier.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedSupplier = await _supplierService.UpdateSupplierAsync(supplier);
                return Ok(updatedSupplier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi güncellenirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi güncellenemedi");
            }
        }

        // DELETE: api/Suppliers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            try
            {
                var result = await _supplierService.DeleteSupplierAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan tedarikçi bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi silinirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi silinemedi");
            }
        }

        // POST: api/Suppliers/5/activate
        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateSupplier(int id)
        {
            try
            {
                var result = await _supplierService.ActivateSupplierAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan tedarikçi bulunamadı");

                return Ok("Tedarikçi aktifleştirildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi aktifleştirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi aktifleştirilemedi");
            }
        }

        // POST: api/Suppliers/5/deactivate
        [HttpPost("{id}/deactivate")]
        public async Task<IActionResult> DeactivateSupplier(int id)
        {
            try
            {
                var result = await _supplierService.DeactivateSupplierAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan tedarikçi bulunamadı");

                return Ok("Tedarikçi deaktifleştirildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi deaktifleştirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi deaktifleştirilemedi");
            }
        }

        // GET: api/Suppliers/5/product-count
        [HttpGet("{id}/product-count")]
        public async Task<ActionResult<int>> GetSupplierProductCount(int id)
        {
            try
            {
                var count = await _supplierService.GetSupplierProductCountAsync(id);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi ürün sayısı getirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi ürün sayısı getirilemedi");
            }
        }

        // GET: api/Suppliers/5/order-count
        [HttpGet("{id}/order-count")]
        public async Task<ActionResult<int>> GetSupplierOrderCount(int id)
        {
            try
            {
                var count = await _supplierService.GetSupplierOrderCountAsync(id);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi sipariş sayısı getirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi sipariş sayısı getirilemedi");
            }
        }

        // GET: api/Suppliers/5/total-value
        [HttpGet("{id}/total-value")]
        public async Task<ActionResult<decimal>> GetSupplierTotalValue(int id)
        {
            try
            {
                var totalValue = await _supplierService.GetSupplierTotalValueAsync(id);
                return Ok(totalValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi toplam değeri getirilirken hata: {SupplierId}", id);
                return StatusCode(500, "Tedarikçi toplam değeri getirilemedi");
            }
        }
    }
}
