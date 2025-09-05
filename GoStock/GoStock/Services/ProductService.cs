using GoStock.Models;
using GoStock.Models.DTOs;
using GoStock.Repositories;
using GoStock.Services;
using System.Text.Json;

namespace GoStock.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IAuditLogService _auditLogService;

        public ProductService(IProductRepository productRepository, IAuditLogService auditLogService)
        {
            _productRepository = productRepository;
            _auditLogService = auditLogService;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _productRepository.GetAllAsync();
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductDtosAsync()
        {
            return await _productRepository.GetAllDtosAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ürün ID'si");

            return await _productRepository.GetByIdAsync(id);
        }

        public async Task<ProductDto?> GetProductDtoByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ürün ID'si");

            return await _productRepository.GetDtoByIdAsync(id);
        }

        public async Task<Product> CreateProductAsync(Product product, string currentUserId)
        {
            if (product == null)
                throw new ArgumentNullException(nameof(product));

            // Business validation
            if (string.IsNullOrWhiteSpace(product.Name))
                throw new ArgumentException("Ürün adı boş olamaz");

            if (product.StockQuantity < 0)
                throw new ArgumentException("Stok miktarı negatif olamaz");

            if (product.Price <= 0)
                throw new ArgumentException("Fiyat 0'dan büyük olmalıdır");

            if (product.CategoryId <= 0)
                throw new ArgumentException("Geçerli bir kategori seçilmelidir");

            product.CreatedAt = DateTime.Now;
            product.UpdatedAt = DateTime.Now;

            var createdProduct = await _productRepository.CreateAsync(product);

            // AuditLog kaydı ekle
            try
            {
                var auditLog = new AuditLog
                {
                    TableName = "Products",
                    EntityName = createdProduct.Name,
                    RecordId = createdProduct.Id,
                    EntityId = createdProduct.Id,
                    Action = "INSERT",
                    Severity = "Info",
                    Timestamp = DateTime.Now,
                    UserId = int.TryParse(currentUserId, out int userId) ? userId : 1, // Kullanıcı ID'sini kullan
                    Details = JsonSerializer.Serialize(new
                    {
                        ProductId = createdProduct.Id,
                        ProductName = createdProduct.Name,
                        CategoryId = createdProduct.CategoryId,
                        Price = createdProduct.Price,
                        StockQuantity = createdProduct.StockQuantity,
                        Description = createdProduct.Description,
                        Action = "INSERT",
                        Message = "Ürün oluşturuldu",
                        UserId = currentUserId
                    })
                };

                await _auditLogService.CreateAuditLogAsync(auditLog);
            }
            catch (Exception ex)
            {
                // AuditLog hatası ürün oluşturmayı engellemesin
                // Log'da kaydet ama işlemi durdurma
            }

            return createdProduct;
        }

        public async Task<Product> UpdateProductAsync(int id, Product product)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ürün ID'si");

            if (product == null)
                throw new ArgumentNullException(nameof(product));

            // Check if product exists
            var existingProduct = await _productRepository.GetByIdAsync(id);
            if (existingProduct == null)
                throw new InvalidOperationException("Güncellenecek ürün bulunamadı");

            // Business validation
            if (string.IsNullOrWhiteSpace(product.Name))
                throw new ArgumentException("Ürün adı boş olamaz");

            if (product.StockQuantity < 0)
                throw new ArgumentException("Stok miktarı negatif olamaz");

            if (product.Price <= 0)
                throw new ArgumentException("Fiyat 0'dan büyük olmalıdır");

            if (product.CategoryId <= 0)
                throw new ArgumentException("Geçerli bir kategori seçilmelidir");

            // Sadece gerçekten değişiklik olduğunda updatedAt güncelle
            var hasChanges = 
                existingProduct.Name != product.Name ||
                existingProduct.Description != product.Description ||
                existingProduct.Price != product.Price ||
                existingProduct.StockQuantity != product.StockQuantity ||
                existingProduct.CategoryId != product.CategoryId;

            product.Id = id;
            
            // Eğer frontend'den updatedAt gelmişse onu kullan, yoksa sadece değişiklik varsa güncelle
            if (product.UpdatedAt == default(DateTime))
            {
                if (hasChanges)
                {
                    product.UpdatedAt = DateTime.Now;
                }
                else
                {
                    product.UpdatedAt = existingProduct.UpdatedAt; // Eski tarihi koru
                }
            }
            // Frontend'den tarih gelmişse onu kullan (zaten doğru tarih)

            var updatedProduct = await _productRepository.UpdateAsync(product);

            // AuditLog kaydı ekle
            try
            {
                var auditLog = new AuditLog
                {
                    TableName = "Products",
                    EntityName = updatedProduct.Name,
                    RecordId = updatedProduct.Id,
                    EntityId = updatedProduct.Id,
                    Action = "UPDATE",
                    Severity = "Info",
                    Timestamp = DateTime.Now,
                    UserId = 1, // Geçici olarak sabit kullanıcı ID
                    Details = JsonSerializer.Serialize(new
                    {
                        ProductId = updatedProduct.Id,
                        ProductName = updatedProduct.Name,
                        CategoryId = updatedProduct.CategoryId,
                        Price = updatedProduct.Price,
                        StockQuantity = updatedProduct.StockQuantity,
                        Description = updatedProduct.Description,
                        Action = "UPDATE",
                        Message = "Ürün güncellendi",
                        OldValues = new
                        {
                            Name = existingProduct.Name,
                            Price = existingProduct.Price,
                            StockQuantity = existingProduct.StockQuantity,
                            Description = existingProduct.Description,
                            CategoryId = existingProduct.CategoryId
                        },
                        NewValues = new
                        {
                            Name = updatedProduct.Name,
                            Price = updatedProduct.Price,
                            StockQuantity = updatedProduct.StockQuantity,
                            Description = updatedProduct.Description,
                            CategoryId = updatedProduct.CategoryId
                        }
                    })
                };

                await _auditLogService.CreateAuditLogAsync(auditLog);
            }
            catch (Exception ex)
            {
                // AuditLog hatası ürün güncellemeyi engellemesin
            }

            return updatedProduct;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ürün ID'si");

            // Silinmeden önce ürün bilgilerini al
            var productToDelete = await _productRepository.GetByIdAsync(id);
            if (productToDelete == null)
                return false;

            var result = await _productRepository.DeleteAsync(id);

            // AuditLog kaydı ekle
            if (result)
            {
                try
                {
                    var auditLog = new AuditLog
                    {
                        TableName = "Products",
                        EntityName = productToDelete.Name,
                        RecordId = productToDelete.Id,
                        EntityId = productToDelete.Id,
                        Action = "DELETE",
                        Severity = "Warning",
                        Timestamp = DateTime.Now,
                        UserId = 1, // Geçici olarak sabit kullanıcı ID
                        Details = JsonSerializer.Serialize(new
                        {
                            ProductId = productToDelete.Id,
                            ProductName = productToDelete.Name,
                            CategoryId = productToDelete.CategoryId,
                            Price = productToDelete.Price,
                            StockQuantity = productToDelete.StockQuantity,
                            Description = productToDelete.Description,
                            Action = "DELETE",
                            Message = "Ürün silindi",
                            DeletedProduct = new
                            {
                                Name = productToDelete.Name,
                                Price = productToDelete.Price,
                                StockQuantity = productToDelete.StockQuantity,
                                Description = productToDelete.Description,
                                CategoryId = productToDelete.CategoryId
                            }
                        })
                    };

                    await _auditLogService.CreateAuditLogAsync(auditLog);
                }
                catch (Exception ex)
                {
                    // AuditLog hatası ürün silmeyi engellemesin
                }
            }

            return result;
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Geçersiz kategori ID'si");

            return await _productRepository.GetByCategoryAsync(categoryId);
        }

        public async Task<IEnumerable<ProductDto>> GetProductDtosByCategoryAsync(int categoryId)
        {
            if (categoryId <= 0)
                throw new ArgumentException("Geçersiz kategori ID'si");

            return await _productRepository.GetDtosByCategoryAsync(categoryId);
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync()
        {
            return await _productRepository.GetLowStockAsync();
        }

        public async Task<IEnumerable<ProductDto>> GetLowStockProductDtosAsync()
        {
            return await _productRepository.GetLowStockDtosAsync();
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                throw new ArgumentException("Arama terimi boş olamaz");

            return await _productRepository.SearchAsync(searchTerm);
        }

        public async Task<IEnumerable<ProductDto>> SearchProductDtosAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                throw new ArgumentException("Arama terimi boş olamaz");

            return await _productRepository.SearchDtosAsync(searchTerm);
        }

        public async Task<IEnumerable<Product>> GetActiveProductsAsync()
        {
            // For now, return all products since we don't have IsActive field
            return await _productRepository.GetAllAsync();
        }

        public async Task<int> GetTotalStockAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Sum(p => p.StockQuantity);
        }

        public async Task<decimal> GetTotalValueAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return products.Sum(p => p.Price * p.StockQuantity);
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _productRepository.GetTotalCountAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0 || pageSize <= 0)
                throw new ArgumentException("Sayfa ve sayfa boyutu 0'dan büyük olmalıdır");

            return await _productRepository.GetWithPaginationAsync(page, pageSize);
        }

        public async Task<IEnumerable<ProductDto>> GetProductDtosWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0 || pageSize <= 0)
                throw new ArgumentException("Sayfa ve sayfa boyutu 0'dan büyük olmalıdır");

            return await _productRepository.GetDtosWithPaginationAsync(page, pageSize);
        }

        public async Task<IEnumerable<CriticalStockDto>> GetCriticalStockProductsAsync()
        {
            try
            {
                var allProducts = await _productRepository.GetAllAsync();
                var criticalProducts = new List<CriticalStockDto>();

                foreach (var product in allProducts)
                {
                    // Kritik stok seviyesi: 10 adet
                    var criticalLevel = 10;
                    // Yeniden sipariş noktası: 20 adet
                    var reorderPoint = 20;

                    if (product.StockQuantity <= criticalLevel)
                    {
                        var requiredQuantity = reorderPoint - product.StockQuantity;
                        var totalValue = product.Price * product.StockQuantity;
                        
                        string stockStatus;
                        if (product.StockQuantity == 0)
                            stockStatus = "Stok Tükendi";
                        else if (product.StockQuantity <= 5)
                            stockStatus = "Kritik Seviye";
                        else
                            stockStatus = "Düşük Stok";

                        var criticalProduct = new CriticalStockDto
                        {
                            Id = product.Id,
                            Name = product.Name,
                            Description = product.Description,
                            CategoryId = product.CategoryId,
                            CategoryName = product.Category?.Name ?? "Bilinmeyen Kategori",
                            Price = product.Price,
                            StockQuantity = product.StockQuantity,
                            CriticalStockLevel = criticalLevel,
                            ReorderPoint = reorderPoint,
                            RequiredQuantity = Math.Max(0, requiredQuantity),
                            TotalValue = totalValue,
                            StockStatus = stockStatus,
                            LastStockMovement = product.UpdatedAt ?? product.CreatedAt,
                            IsActive = product.IsActive
                        };

                        criticalProducts.Add(criticalProduct);
                    }
                }

                return criticalProducts.OrderBy(p => p.StockQuantity).ThenBy(p => p.Name);
            }
            catch (Exception ex)
            {
                throw new Exception("Kritik stok ürünleri getirilemedi", ex);
            }
        }
    }
}
