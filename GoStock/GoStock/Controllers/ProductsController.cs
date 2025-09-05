using Microsoft.AspNetCore.Mvc;
using GoStock.Models;
using GoStock.Models.DTOs;
using GoStock.Services;
using System.Security.Claims;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// Tüm ürünleri getir
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProductDto>>>> GetProducts()
        {
            try
            {
                var products = await _productService.GetAllProductDtosAsync();
                return Ok(ApiResponse<IEnumerable<ProductDto>>.SuccessResult(products, "Ürünler başarıyla getirildi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürünler getirilirken hata oluştu");
                return StatusCode(500, ApiResponse<IEnumerable<ProductDto>>.ErrorResult("Ürünler getirilirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// ID'ye göre ürün getir
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductDtoByIdAsync(id);
                
                if (product == null)
                    return NotFound(ApiResponse<ProductDto>.ErrorResult($"ID: {id} olan ürün bulunamadı"));

                return Ok(ApiResponse<ProductDto>.SuccessResult(product, "Ürün başarıyla getirildi"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Geçersiz ürün ID'si: {Id}", id);
                return BadRequest(ApiResponse<ProductDto>.ErrorResult("Geçersiz ürün ID'si", ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün getirilirken hata oluştu. ID: {Id}", id);
                return StatusCode(500, ApiResponse<ProductDto>.ErrorResult("Ürün getirilirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Kritik stok seviyesindeki ürünleri getir
        /// </summary>
        [HttpGet("critical-stock")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CriticalStockDto>>>> GetCriticalStockProducts()
        {
            try
            {
                var criticalProducts = await _productService.GetCriticalStockProductsAsync();
                return Ok(ApiResponse<IEnumerable<CriticalStockDto>>.SuccessResult(criticalProducts, "Kritik stok ürünleri başarıyla getirildi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kritik stok ürünleri getirilirken hata oluştu");
                return StatusCode(500, ApiResponse<IEnumerable<CriticalStockDto>>.ErrorResult("Kritik stok ürünleri getirilirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Yeni ürün oluştur
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Product>>> CreateProduct(Product product)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<Product>.ErrorResult("Validation hatası", errors));
                }

                // Mevcut kullanıcının ID'sini al
                var currentUserId = GetCurrentUserId();
                
                var createdProduct = await _productService.CreateProductAsync(product, currentUserId);
                
                return CreatedAtAction(
                    nameof(GetProduct), 
                    new { id = createdProduct.Id }, 
                    ApiResponse<Product>.SuccessResult(createdProduct, "Ürün başarıyla oluşturuldu"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Ürün oluşturulurken validation hatası");
                return BadRequest(ApiResponse<Product>.ErrorResult("Validation hatası", ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün oluşturulurken hata oluştu");
                return StatusCode(500, ApiResponse<Product>.ErrorResult("Ürün oluşturulurken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Ürün güncelle
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Product>>> UpdateProduct(int id, Product product)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<Product>.ErrorResult("Validation hatası", errors));
                }

                var updatedProduct = await _productService.UpdateProductAsync(id, product);
                return Ok(ApiResponse<Product>.SuccessResult(updatedProduct, "Ürün başarıyla güncellendi"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Ürün güncellenirken validation hatası. ID: {Id}", id);
                return BadRequest(ApiResponse<Product>.ErrorResult("Validation hatası", ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Güncellenecek ürün bulunamadı. ID: {Id}", id);
                return NotFound(ApiResponse<Product>.ErrorResult("Ürün bulunamadı", ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün güncellenirken hata oluştu. ID: {Id}", id);
                return StatusCode(500, ApiResponse<Product>.ErrorResult("Ürün güncellenirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Ürün sil
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                
                if (!result)
                    return NotFound(ApiResponse.ErrorResult($"ID: {id} olan ürün bulunamadı"));

                return Ok(ApiResponse.SuccessResult("Ürün başarıyla silindi"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Geçersiz ürün ID'si: {Id}", id);
                return BadRequest(ApiResponse.ErrorResult("Geçersiz ürün ID'si", ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün silinirken hata oluştu. ID: {Id}", id);
                return StatusCode(500, ApiResponse.ErrorResult("Ürün silinirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Kategoriye göre ürünleri getir
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<Product>>>> GetProductsByCategory(int categoryId)
        {
            try
            {
                var products = await _productService.GetProductsByCategoryAsync(categoryId);
                return Ok(ApiResponse<IEnumerable<Product>>.SuccessResult(products, "Kategori ürünleri başarıyla getirildi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürünleri getirilirken hata oluştu. CategoryId: {CategoryId}", categoryId);
                return StatusCode(500, ApiResponse<IEnumerable<Product>>.ErrorResult("Kategori ürünleri getirilirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Düşük stok uyarısı
        /// </summary>
        [HttpGet("low-stock")]
        public async Task<ActionResult<ApiResponse<IEnumerable<Product>>>> GetLowStockProducts()
        {
            try
            {
                var products = await _productService.GetLowStockProductsAsync();
                return Ok(ApiResponse<IEnumerable<Product>>.SuccessResult(products, "Düşük stok ürünleri başarıyla getirildi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Düşük stok ürünleri getirilirken hata oluştu");
                return StatusCode(500, ApiResponse<IEnumerable<Product>>.ErrorResult("Düşük stok ürünleri getirilirken bir hata oluştu", ex.Message));
            }
        }

        private string GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                // Email'den de alabiliriz
                userIdClaim = User.FindFirst(ClaimTypes.Email)?.Value;
            }
            
            return userIdClaim ?? "anonymous";
        }
    }
}

