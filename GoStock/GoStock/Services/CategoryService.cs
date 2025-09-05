using GoStock.Repositories;
using GoStock.Models;
using GoStock.Models.DTOs;
using System.Text.Json;

namespace GoStock.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ICategoryRepository categoryRepository, IAuditLogService auditLogService, ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            try
            {
                return await _categoryRepository.GetAllCategoriesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategoriler getirilirken hata oluştu");
                throw new Exception("Kategoriler getirilemedi");
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoryDtosAsync()
        {
            try
            {
                return await _categoryRepository.GetAllCategoryDtosAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori DTO'ları getirilirken hata oluştu");
                throw new Exception("Kategori DTO'ları getirilemedi");
            }
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                return await _categoryRepository.GetCategoryByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ID: {CategoryId} getirilirken hata oluştu", id);
                throw new Exception("Kategori getirilemedi");
            }
        }

        public async Task<CategoryDto?> GetCategoryDtoByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                return await _categoryRepository.GetCategoryDtoByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori DTO ID: {CategoryId} getirilirken hata oluştu", id);
                throw new Exception("Kategori DTO getirilemedi");
            }
        }

        public async Task<CategoryDetailDto?> GetCategoryDetailDtoByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                return await _categoryRepository.GetCategoryDetailDtoByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori detay DTO ID: {CategoryId} getirilirken hata oluştu", id);
                throw new Exception("Kategori detay DTO getirilemedi");
            }
        }

        public async Task<Category?> GetCategoryByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Kategori adı boş olamaz");

            try
            {
                return await _categoryRepository.GetCategoryByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori adı: {Name} getirilirken hata oluştu", name);
                throw new Exception("Kategori getirilemedi");
            }
        }

        public async Task<Category> CreateCategoryAsync(Category category, string currentUserId)
        {
            if (category == null)
                throw new ArgumentNullException(nameof(category));

            if (string.IsNullOrWhiteSpace(category.Name))
                throw new ArgumentException("Kategori adı zorunludur");

            // Kategori adı benzersizlik kontrolü
            if (await _categoryRepository.CategoryNameExistsAsync(category.Name))
                throw new Exception("Bu kategori adı zaten kullanılıyor");

            try
            {
                var createdCategory = await _categoryRepository.CreateCategoryAsync(category);
                _logger.LogInformation("Yeni kategori oluşturuldu: {Name}", category.Name);

                // AuditLog kaydı ekle
                try
                {
                    var auditLog = new AuditLog
                    {
                        TableName = "Categories",
                        EntityName = createdCategory.Name,
                        RecordId = createdCategory.Id,
                        EntityId = createdCategory.Id,
                        Action = "INSERT",
                        Severity = "Info",
                        Timestamp = DateTime.Now,
                        UserId = int.TryParse(currentUserId, out int userId) ? userId : 1, // Kullanıcı ID'sini kullan
                        Details = JsonSerializer.Serialize(new
                        {
                            CategoryId = createdCategory.Id,
                            CategoryName = createdCategory.Name,
                            Description = createdCategory.Description,
                            Color = createdCategory.Color,
                            Action = "INSERT",
                            Message = "Kategori oluşturuldu",
                            UserId = currentUserId
                        })
                    };

                    await _auditLogService.CreateAuditLogAsync(auditLog);
                }
                catch (Exception ex)
                {
                    // AuditLog hatası kategori oluşturmayı engellemesin
                    _logger.LogError(ex, "Kategori oluşturma audit log hatası: {Message}", ex.Message);
                }

                return createdCategory;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori oluşturulurken hata: {Name}", category.Name);
                throw new Exception("Kategori oluşturulamadı");
            }
        }

        public async Task<Category> UpdateCategoryAsync(Category category)
        {
            if (category == null)
                throw new ArgumentNullException(nameof(category));

            if (category.Id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            if (string.IsNullOrWhiteSpace(category.Name))
                throw new ArgumentException("Kategori adı zorunludur");

            // Kategori adı benzersizlik kontrolü (kendisi hariç)
            var existingCategory = await _categoryRepository.GetCategoryByNameAsync(category.Name);
            if (existingCategory != null && existingCategory.Id != category.Id)
                throw new Exception("Bu kategori adı zaten kullanılıyor");

            // Kategorinin var olup olmadığını kontrol et
            if (!await _categoryRepository.CategoryExistsAsync(category.Id))
                throw new Exception("Kategori bulunamadı");

            try
            {
                var updatedCategory = await _categoryRepository.UpdateCategoryAsync(category);
                _logger.LogInformation("Kategori güncellendi: {CategoryId} - {Name}", category.Id, category.Name);
                return updatedCategory;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori güncellenirken hata: {CategoryId}", category.Id);
                throw new Exception("Kategori güncellenemedi");
            }
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                // Kategoride ürün var mı kontrol et
                if (await _categoryRepository.GetCategoryProductCountAsync(id) > 0)
                    throw new Exception("Bu kategoride ürünler bulunduğu için silinemez");

                var result = await _categoryRepository.DeleteCategoryAsync(id);
                if (result)
                {
                    _logger.LogInformation("Kategori silindi: {CategoryId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori silinirken hata: {CategoryId}", id);
                throw new Exception("Kategori silinemedi");
            }
        }

        // Kategori yönetimi
        public async Task<IEnumerable<Category>> GetActiveCategoriesAsync()
        {
            try
            {
                return await _categoryRepository.GetActiveCategoriesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif kategoriler getirilirken hata");
                throw new Exception("Aktif kategoriler getirilemedi");
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetActiveCategoryDtosAsync()
        {
            try
            {
                return await _categoryRepository.GetActiveCategoryDtosAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif kategori DTO'ları getirilirken hata");
                throw new Exception("Aktif kategori DTO'ları getirilemedi");
            }
        }

        public async Task<bool> ActivateCategoryAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                var category = await _categoryRepository.GetCategoryByIdAsync(id);
                if (category == null)
                    return false;

                // Burada IsActive field'ı varsa true yapılabilir
                // Şimdilik sadece true döndürüyoruz
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori aktifleştirilirken hata: {CategoryId}", id);
                throw new Exception("Kategori aktifleştirilemedi");
            }
        }

        public async Task<bool> DeactivateCategoryAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                var category = await _categoryRepository.GetCategoryByIdAsync(id);
                if (category == null)
                    return false;

                // Burada IsActive field'ı varsa false yapılabilir
                // Şimdilik sadece true döndürüyoruz
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori deaktifleştirilirken hata: {CategoryId}", id);
                throw new Exception("Kategori deaktifleştirilemedi");
            }
        }

        public async Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Kategori adı boş olamaz");

            try
            {
                var existingCategory = await _categoryRepository.GetCategoryByNameAsync(name);
                if (existingCategory == null)
                    return true;

                // Eğer excludeCategoryId verilmişse ve aynı kategori ise, benzersiz kabul et
                if (excludeCategoryId.HasValue && existingCategory.Id == excludeCategoryId.Value)
                    return true;

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori adı benzersizlik kontrolü yapılırken hata: {Name}", name);
                throw new Exception("Kategori adı benzersizlik kontrolü yapılamadı");
            }
        }

        // Ürün yönetimi
        public Task<IEnumerable<Product>> GetCategoryProductsAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                // Bu metod repository'de yok, şimdilik boş liste döndürüyoruz
                return Task.FromResult<IEnumerable<Product>>(new List<Product>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürünleri getirilirken hata: {CategoryId}", categoryId);
                throw new Exception("Kategori ürünleri getirilemedi");
            }
        }

        public Task<int> GetCategoryProductCountAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                // Bu metod repository'de yok, şimdilik 0 döndürüyoruz
                return Task.FromResult(0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürün sayısı getirilemedi");
                throw new Exception("Kategori ürün sayısı getirilemedi");
            }
        }

        public async Task<bool> HasProductsAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                var productCount = await GetCategoryProductCountAsync(categoryId);
                return productCount > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürün varlığı kontrol edilirken hata: {CategoryId}", categoryId);
                throw new Exception("Kategori ürün varlığı kontrol edilemedi");
            }
        }

        public async Task<decimal> GetCategoryTotalValueAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Geçersiz kategori ID");

            try
            {
                return await _categoryRepository.GetCategoryTotalValueAsync(categoryId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori toplam değeri hesaplanırken hata: {CategoryId}", categoryId);
                throw new Exception("Kategori toplam değeri hesaplanamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<Category>> SearchCategoriesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                throw new ArgumentException("Arama terimi boş olamaz");

            try
            {
                var allCategories = await _categoryRepository.GetAllCategoriesAsync();
                return allCategories.Where(c => 
                    c.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    (c.Description != null && c.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori araması yapılırken hata: {SearchTerm}", searchTerm);
                throw new Exception("Kategori araması yapılamadı");
            }
        }

        public async Task<IEnumerable<Category>> GetCategoriesWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0 || pageSize <= 0)
                throw new ArgumentException("Sayfa ve sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _categoryRepository.GetCategoriesWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı kategori listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Kategori listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoryDtosWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0 || pageSize <= 0)
                throw new ArgumentException("Sayfa ve sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _categoryRepository.GetCategoryDtosWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı kategori DTO listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Kategori DTO listesi getirilemedi");
            }
        }

        public async Task<int> GetTotalCategoriesCountAsync()
        {
            try
            {
                return await _categoryRepository.GetTotalCategoriesCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam kategori sayısı getirilirken hata");
                throw new Exception("Toplam kategori sayısı getirilemedi");
            }
        }

        // İstatistikler
        public async Task<Dictionary<string, int>> GetCategoryProductDistributionAsync()
        {
            try
            {
                var categories = await _categoryRepository.GetAllCategoriesAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var category in categories)
                {
                    var productCount = await _categoryRepository.GetCategoryProductCountAsync(category.Id);
                    distribution[category.Name] = productCount;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ürün dağılımı hesaplanırken hata");
                throw new Exception("Kategori ürün dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, decimal>> GetCategoryValueDistributionAsync()
        {
            try
            {
                var categories = await _categoryRepository.GetAllCategoriesAsync();
                var distribution = new Dictionary<string, decimal>();

                foreach (var category in categories)
                {
                    var totalValue = await GetCategoryTotalValueAsync(category.Id);
                    distribution[category.Name] = totalValue;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori değer dağılımı hesaplanırken hata");
                throw new Exception("Kategori değer dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<Category>> GetTopCategoriesByProductCountAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var categories = await _categoryRepository.GetAllCategoriesAsync();
                var categoryProductCounts = new List<(Category Category, int ProductCount)>();

                foreach (var category in categories)
                {
                    var productCount = await _categoryRepository.GetCategoryProductCountAsync(category.Id);
                    categoryProductCounts.Add((category, productCount));
                }

                return categoryProductCounts
                    .OrderByDescending(x => x.ProductCount)
                    .Take(count)
                    .Select(x => x.Category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok ürün içeren kategoriler getirilirken hata: {Count}", count);
                throw new Exception("En çok ürün içeren kategoriler getirilemedi");
            }
        }

        public async Task<IEnumerable<CategoryStatsDto>> GetCategoriesWithStatsAsync()
        {
            try
            {
                var categories = await _categoryRepository.GetAllCategoriesAsync();
                var categoriesWithStats = new List<CategoryStatsDto>();

                foreach (var category in categories)
                {
                    var productCount = await _categoryRepository.GetCategoryProductCountAsync(category.Id);
                    var totalValue = await GetCategoryTotalValueAsync(category.Id);

                    var categoryStats = new CategoryStatsDto
                    {
                        Id = category.Id,
                        Name = category.Name,
                        Description = category.Description,
                        Color = category.Color,
                        CreatedAt = category.CreatedAt,
                        ProductCount = productCount,
                        TotalValue = totalValue
                    };

                    categoriesWithStats.Add(categoryStats);
                }

                return categoriesWithStats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategoriler istatistikleri ile getirilirken hata");
                throw new Exception("Kategoriler istatistikleri ile getirilemedi");
            }
        }
    }
}
