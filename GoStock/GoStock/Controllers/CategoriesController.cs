using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;
using GoStock.Models.DTOs;
using System.Security.Claims;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoryDtosAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategoriler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Kategoriler getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryDtoByIdAsync(id);
                if (category == null)
                    return NotFound(new { message = $"ID: {id} olan kategori bulunamadı" });

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ID: {CategoryId} getirilirken hata oluştu", id);
                return StatusCode(500, new { message = "Kategori getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/5/detail
        [HttpGet("{id}/detail")]
        public async Task<ActionResult<CategoryDetailDto>> GetCategoryDetail(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryDetailDtoByIdAsync(id);
                if (category == null)
                    return NotFound(new { message = $"ID: {id} olan kategori bulunamadı" });

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori detayı ID: {CategoryId} getirilirken hata oluştu", id);
                return StatusCode(500, new { message = "Kategori detayı getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/name/Electronics
        [HttpGet("name/{name}")]
        public async Task<ActionResult<CategoryDto>> GetCategoryByName(string name)
        {
            try
            {
                var category = await _categoryService.GetCategoryByNameAsync(name);
                if (category == null)
                    return NotFound(new { message = $"Ad: {name} olan kategori bulunamadı" });

                // Convert to DTO
                var categoryDto = new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    Color = category.Color,
                    CreatedAt = category.CreatedAt,
                    ProductCount = category.Products.Count
                };

                return Ok(categoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ad: {Name} kategorisi getirilirken hata oluştu", name);
                return StatusCode(500, new { message = "Kategori getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetActiveCategories()
        {
            try
            {
                var categories = await _categoryService.GetActiveCategoryDtosAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif kategoriler getirilirken hata oluştu");
                return StatusCode(500, new { message = "Aktif kategoriler getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCategoriesCount()
        {
            try
            {
                var count = await _categoryService.GetTotalCategoriesCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori sayısı getirilirken hata oluştu");
                return StatusCode(500, new { message = "Kategori sayısı getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/5/products
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<Product>>> GetCategoryProducts(int id)
        {
            try
            {
                var products = await _categoryService.GetCategoryProductsAsync(id);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürünleri getirilirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori ürünleri getirilemedi", error = ex.Message });
            }
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Mevcut kullanıcının ID'sini al
                var currentUserId = GetCurrentUserId();
                
                var createdCategory = await _categoryService.CreateCategoryAsync(category, currentUserId);
                return CreatedAtAction(nameof(GetCategory), new { id = createdCategory.Id }, createdCategory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori oluşturulurken hata: {Name}", category.Name);
                return StatusCode(500, new { message = "Kategori oluşturulamadı", error = ex.Message });
            }
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, Category category)
        {
            try
            {
                if (id != category.Id)
                    return BadRequest(new { message = "ID uyuşmazlığı" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedCategory = await _categoryService.UpdateCategoryAsync(category);
                
                // Güncel kategori DTO'sunu döndür
                var categoryDto = await _categoryService.GetCategoryDtoByIdAsync(updatedCategory.Id);
                return Ok(categoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori güncellenirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori güncellenemedi", error = ex.Message });
            }
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _categoryService.DeleteCategoryAsync(id);
                if (!result)
                    return NotFound(new { message = $"ID: {id} olan kategori bulunamadı" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori silinirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori silinemedi", error = ex.Message });
            }
        }

        // POST: api/Categories/5/activate
        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateCategory(int id)
        {
            try
            {
                var result = await _categoryService.ActivateCategoryAsync(id);
                if (!result)
                    return NotFound(new { message = $"ID: {id} olan kategori bulunamadı" });

                return Ok(new { message = "Kategori aktifleştirildi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori aktifleştirilirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori aktifleştirilemedi", error = ex.Message });
            }
        }

        // POST: api/Categories/5/deactivate
        [HttpPost("{id}/deactivate")]
        public async Task<IActionResult> DeactivateCategory(int id)
        {
            try
            {
                var result = await _categoryService.DeactivateCategoryAsync(id);
                if (!result)
                    return NotFound(new { message = $"ID: {id} olan kategori bulunamadı" });

                return Ok(new { message = "Kategori deaktifleştirildi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori deaktifleştirilirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori deaktifleştirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/5/product-count
        [HttpGet("{id}/product-count")]
        public async Task<ActionResult<int>> GetCategoryProductCount(int id)
        {
            try
            {
                var count = await _categoryService.GetCategoryProductCountAsync(id);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürün sayısı getirilirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori ürün sayısı getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/5/total-value
        [HttpGet("{id}/total-value")]
        public async Task<ActionResult<decimal>> GetCategoryTotalValue(int id)
        {
            try
            {
                var totalValue = await _categoryService.GetCategoryTotalValueAsync(id);
                return Ok(totalValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori toplam değeri getirilirken hata: {CategoryId}", id);
                return StatusCode(500, new { message = "Kategori toplam değeri getirilemedi", error = ex.Message });
            }
        }

        // GET: api/Categories/with-stats
        [HttpGet("with-stats")]
        public async Task<ActionResult<IEnumerable<CategoryStatsDto>>> GetCategoriesWithStats()
        {
            try
            {
                var categoriesWithStats = await _categoryService.GetCategoriesWithStatsAsync();
                return Ok(categoriesWithStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategoriler istatistikleri ile getirilirken hata oluştu");
                return StatusCode(500, new { message = "Kategoriler istatistikleri ile getirilemedi", error = ex.Message });
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
