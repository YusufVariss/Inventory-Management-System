using GoStock.Repositories;
using GoStock.Models;
using GoStock.Services;
using System.Text.Json;

namespace GoStock.Services
{
    public class StockMovementService : IStockMovementService
    {
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IProductRepository _productRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<StockMovementService> _logger;

        public StockMovementService(
            IStockMovementRepository stockMovementRepository,
            IProductRepository productRepository,
            IAuditLogService auditLogService,
            ILogger<StockMovementService> logger)
        {
            _stockMovementRepository = stockMovementRepository;
            _productRepository = productRepository;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<StockMovement>> GetAllStockMovementsAsync()
        {
            try
            {
                return await _stockMovementRepository.GetAllStockMovementsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketleri getirilirken hata oluştu");
                throw new Exception("Stok hareketleri getirilemedi");
            }
        }

        public async Task<IEnumerable<StockMovement>> GetAllStockMovementsWithoutNavigationAsync()
        {
            try
            {
                return await _stockMovementRepository.GetAllStockMovementsWithoutNavigationAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketleri getirilirken hata oluştu");
                throw new Exception("Stok hareketleri getirilemedi");
            }
        }

        public async Task<StockMovement?> GetStockMovementByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz stok hareket ID");

            try
            {
                return await _stockMovementRepository.GetStockMovementByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareket ID: {StockMovementId} getirilirken hata oluştu", id);
                throw new Exception("Stok hareket getirilemedi");
            }
        }

        public async Task<StockMovement> CreateStockMovementAsync(StockMovement stockMovement)
        {
            if (stockMovement == null)
                throw new ArgumentNullException(nameof(stockMovement));

            if (!stockMovement.ProductId.HasValue || stockMovement.ProductId.Value <= 0)
                throw new ArgumentException("Ürün ID zorunludur");

            if (!stockMovement.UserId.HasValue || stockMovement.UserId.Value <= 0)
                throw new ArgumentException("Kullanıcı ID zorunludur");

            if (stockMovement.Quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (string.IsNullOrWhiteSpace(stockMovement.MovementType))
                throw new ArgumentException("Hareket türü zorunludur");

            // Stok hareket doğrulaması
            if (!await ValidateStockMovementAsync(stockMovement))
                throw new Exception("Stok hareket doğrulanamadı");

            try
            {
                var createdMovement = await _stockMovementRepository.CreateStockMovementAsync(stockMovement);
                
                // Ürün stok miktarını güncelle
                if (stockMovement.ProductId.HasValue)
                {
                    await UpdateProductStockAsync(stockMovement.ProductId.Value, stockMovement.Quantity, stockMovement.MovementType);
                }
                
                _logger.LogInformation("Yeni stok hareketi oluşturuldu: {ProductId} - {Type} - {Quantity}", 
                    stockMovement.ProductId, stockMovement.MovementType, stockMovement.Quantity);
                
                // AuditLog kaydı ekle
                try
                {
                    // Kullanıcı bilgisini al - şimdilik sabit değer kullan
                    var userName = "Sistem"; // TODO: User repository'den al
                    
                    // Ürün bilgisini al
                    var product = await _productRepository.GetByIdAsync(stockMovement.ProductId.Value);
                    var productName = product?.Name ?? $"Ürün {stockMovement.ProductId}";
                    
                    var auditLog = new AuditLog
                    {
                        TableName = "StockMovements",
                        EntityName = $"Stok Hareketi - {stockMovement.MovementType}",
                        RecordId = createdMovement.Id,
                        EntityId = createdMovement.Id,
                        Action = "INSERT",
                        Severity = "Info",
                        Timestamp = DateTime.Now,
                        UserId = stockMovement.UserId ?? 1,
                        Details = JsonSerializer.Serialize(new
                        {
                            ProductId = stockMovement.ProductId,
                            ProductName = productName, // Ürün adını da ekle
                            Quantity = stockMovement.Quantity,
                            MovementType = stockMovement.MovementType,
                            PreviousStock = stockMovement.PreviousStock,
                            NewStock = stockMovement.NewStock,
                            Reference = stockMovement.Reference,
                            Notes = stockMovement.Notes,
                            UserName = userName // Kullanıcı adını details'a da ekle
                        })
                    };

                    await _auditLogService.CreateAuditLogAsync(auditLog);
                }
                catch (Exception ex)
                {
                    // AuditLog hatası stok hareketi oluşturmayı engellemesin
                    _logger.LogWarning(ex, "Audit log kaydı oluşturulamadı");
                }
                
                return createdMovement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi oluşturulurken hata: {ProductId}", stockMovement.ProductId);
                throw new Exception("Stok hareketi oluşturulamadı");
            }
        }

        public async Task<StockMovement> UpdateStockMovementAsync(StockMovement stockMovement)
        {
            if (stockMovement == null)
                throw new ArgumentNullException(nameof(stockMovement));

            if (stockMovement.Id <= 0)
                throw new ArgumentException("Geçersiz stok hareket ID");

            // Stok hareketin var olup olmadığını kontrol et
            if (!await _stockMovementRepository.StockMovementExistsAsync(stockMovement.Id))
                throw new Exception("Stok hareket bulunamadı");

            try
            {
                var updatedMovement = await _stockMovementRepository.UpdateStockMovementAsync(stockMovement);
                _logger.LogInformation("Stok hareketi güncellendi: {StockMovementId}", stockMovement.Id);
                
                // AuditLog kaydı ekle
                try
                {
                    // Kullanıcı bilgisini al - şimdilik sabit değer kullan
                    var userName = "Sistem"; // TODO: User repository'den al
                    
                    // Ürün bilgisini al
                    var product = await _productRepository.GetByIdAsync(stockMovement.ProductId.Value);
                    var productName = product?.Name ?? $"Ürün {stockMovement.ProductId}";
                    
                    var auditLog = new AuditLog
                    {
                        TableName = "StockMovements",
                        EntityName = $"Stok Hareketi - {stockMovement.MovementType}",
                        RecordId = updatedMovement.Id,
                        EntityId = updatedMovement.Id,
                        Action = "UPDATE",
                        Severity = "Info",
                        Timestamp = DateTime.Now,
                        UserId = stockMovement.UserId ?? 1,
                        Details = JsonSerializer.Serialize(new
                        {
                            ProductId = stockMovement.ProductId,
                            ProductName = productName,
                            Quantity = stockMovement.Quantity,
                            MovementType = stockMovement.MovementType,
                            PreviousStock = stockMovement.PreviousStock,
                            NewStock = stockMovement.NewStock,
                            Reference = stockMovement.Reference,
                            Notes = stockMovement.Notes,
                            UserName = userName
                        })
                    };

                    await _auditLogService.CreateAuditLogAsync(auditLog);
                }
                catch (Exception ex)
                {
                    // AuditLog hatası stok hareketi güncellemeyi engellemesin
                    _logger.LogWarning(ex, "Audit log kaydı oluşturulamadı");
                }
                
                return updatedMovement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi güncellenirken hata: {StockMovementId}", stockMovement.Id);
                throw new Exception("Stok hareketi güncellenemedi");
            }
        }

        public async Task<bool> DeleteStockMovementAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz stok hareket ID");

            try
            {
                // Silmeden önce stok hareketi bilgilerini al
                var stockMovement = await _stockMovementRepository.GetStockMovementByIdAsync(id);
                if (stockMovement == null)
                    return false;

                var result = await _stockMovementRepository.DeleteStockMovementAsync(id);
                if (result)
                {
                    _logger.LogInformation("Stok hareketi silindi: {StockMovementId}", id);
                    
                    // AuditLog kaydı ekle
                    try
                    {
                        // Kullanıcı bilgisini al - şimdilik sabit değer kullan
                        var userName = "Sistem"; // TODO: User repository'den al
                        
                        // Ürün bilgisini al
                        var product = await _productRepository.GetByIdAsync(stockMovement.ProductId.Value);
                        var productName = product?.Name ?? $"Ürün {stockMovement.ProductId}";
                        
                        var auditLog = new AuditLog
                        {
                            TableName = "StockMovements",
                            EntityName = $"Stok Hareketi - {stockMovement.MovementType}",
                            RecordId = id,
                            EntityId = id,
                            Action = "DELETE",
                            Severity = "Info",
                            Timestamp = DateTime.Now,
                            UserId = stockMovement.UserId ?? 1,
                            Details = JsonSerializer.Serialize(new
                            {
                                ProductId = stockMovement.ProductId,
                                ProductName = productName,
                                Quantity = stockMovement.Quantity,
                                MovementType = stockMovement.MovementType,
                                PreviousStock = stockMovement.PreviousStock,
                                NewStock = stockMovement.NewStock,
                                Reference = stockMovement.Reference,
                                Notes = stockMovement.Notes,
                                UserName = userName
                            })
                        };

                        await _auditLogService.CreateAuditLogAsync(auditLog);
                    }
                    catch (Exception ex)
                    {
                        // AuditLog hatası stok hareketi silmeyi engellemesin
                        _logger.LogWarning(ex, "Audit log kaydı oluşturulamadı");
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareketi silinirken hata: {StockMovementId}", id);
                throw new Exception("Stok hareketi silinemedi");
            }
        }

        // Stok hareket yönetimi
        public async Task<IEnumerable<StockMovement>> GetStockMovementsByProductAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _stockMovementRepository.GetStockMovementsByProductAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün stok hareketleri getirilirken hata: {ProductId}", productId);
                throw new Exception("Ürün stok hareketleri getirilemedi");
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByTypeAsync(string movementType)
        {
            if (string.IsNullOrWhiteSpace(movementType))
                throw new ArgumentException("Hareket türü belirtilmelidir");

            try
            {
                return await _stockMovementRepository.GetStockMovementsByTypeAsync(movementType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hareket türü stok hareketleri getirilirken hata: {MovementType}", movementType);
                throw new Exception("Hareket türü stok hareketleri getirilemedi");
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _stockMovementRepository.GetStockMovementsByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı stok hareketleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı stok hareketleri getirilemedi");
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _stockMovementRepository.GetStockMovementsByUserAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı stok hareketleri getirilirken hata: {UserId}", userId);
                throw new Exception("Kullanıcı stok hareketleri getirilemedi");
            }
        }

        // Stok kontrolü
        public async Task<bool> StockMovementExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz stok hareket ID");

            try
            {
                return await _stockMovementRepository.StockMovementExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareket varlık kontrolü yapılırken hata: {StockMovementId}", id);
                throw new Exception("Stok hareket varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalStockMovementsCountAsync()
        {
            try
            {
                return await _stockMovementRepository.GetTotalStockMovementsCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam stok hareket sayısı getirilirken hata");
                throw new Exception("Toplam stok hareket sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetProductTotalStockValueAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _stockMovementRepository.GetProductTotalStockValueAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün toplam stok değeri hesaplanırken hata: {ProductId}", productId);
                throw new Exception("Ürün toplam stok değeri hesaplanamadı");
            }
        }

        public async Task<int> GetProductTotalStockInAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _stockMovementRepository.GetProductTotalStockInAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün toplam stok girişi hesaplanırken hata: {ProductId}", productId);
                throw new Exception("Ürün toplam stok girişi hesaplanamadı");
            }
        }

        public async Task<int> GetProductTotalStockOutAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _stockMovementRepository.GetProductTotalStockOutAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün toplam stok çıkışı hesaplanırken hata: {ProductId}", productId);
                throw new Exception("Ürün toplam stok çıkışı hesaplanamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<StockMovement>> GetStockMovementsWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _stockMovementRepository.GetStockMovementsWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı stok hareket listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Stok hareket listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<StockMovement>> GetLowStockAlertsAsync()
        {
            try
            {
                return await _stockMovementRepository.GetLowStockAlertsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Düşük stok uyarıları getirilirken hata");
                throw new Exception("Düşük stok uyarıları getirilemedi");
            }
        }

        // İş mantığı
        public async Task<StockMovement> ProcessStockInAsync(int? productId, int quantity, int? userId, decimal? unitPrice = null, decimal? totalAmount = null, string? reference = null, string? notes = null)
        {
            if (!productId.HasValue || productId.Value <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            if (quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                // Get current product to get current stock
                var product = await _productRepository.GetByIdAsync(productId.Value);
                if (product == null)
                    throw new Exception("Ürün bulunamadı");

                var currentStock = product.StockQuantity;
                var newStock = currentStock + quantity;

                // Eğer TotalAmount verilmemişse ve UnitPrice varsa hesapla
                if (totalAmount == null && unitPrice.HasValue)
                {
                    totalAmount = unitPrice.Value * quantity;
                }

                var stockMovement = new StockMovement
                {
                    ProductId = productId,
                    UserId = userId,
                    Quantity = quantity,
                    MovementType = "in",
                    Notes = notes,
                    Reference = reference,
                    UnitPrice = unitPrice,
                    TotalAmount = totalAmount,
                    MovementDate = DateTime.Now,
                    PreviousStock = currentStock,
                    NewStock = newStock
                };

                var createdMovement = await CreateStockMovementAsync(stockMovement);
                _logger.LogInformation("Stok girişi işlendi: {ProductId} - {Quantity}", productId.Value, quantity);
                
                return createdMovement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok girişi işlenirken hata: {ProductId} - {Quantity}", productId, quantity);
                throw new Exception("Stok girişi işlenemedi");
            }
        }

        public async Task<StockMovement> ProcessStockOutAsync(int? productId, int quantity, int? userId, decimal? unitPrice = null, decimal? totalAmount = null, string? reference = null, string? notes = null)
        {
            if (!productId.HasValue || productId.Value <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            if (quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (!userId.HasValue || userId.Value <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            // Stok çıkışı yapılabilir mi kontrol et
            if (!await CanProcessStockOutAsync(productId, quantity))
                throw new Exception("Yeterli stok bulunmuyor");

            try
            {
                // Get current product to get current stock
                var product = await _productRepository.GetByIdAsync(productId.Value);
                if (product == null)
                    throw new Exception("Ürün bulunamadı");

                var currentStock = product.StockQuantity;
                var newStock = Math.Max(0, currentStock - quantity);

                // Eğer TotalAmount verilmemişse ve UnitPrice varsa hesapla
                if (totalAmount == null && unitPrice.HasValue)
                {
                    totalAmount = unitPrice.Value * quantity;
                }

                var stockMovement = new StockMovement
                {
                    ProductId = productId,
                    UserId = userId,
                    Quantity = quantity,
                    MovementType = "out",
                    Notes = notes,
                    Reference = reference,
                    UnitPrice = unitPrice,
                    TotalAmount = totalAmount,
                    MovementDate = DateTime.Now,
                    PreviousStock = currentStock,
                    NewStock = newStock
                };

                var createdMovement = await CreateStockMovementAsync(stockMovement);
                _logger.LogInformation("Stok çıkışı işlendi: {ProductId} - {Quantity}", productId.Value, quantity);
                
                return createdMovement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok çıkışı işlenirken hata: {ProductId} - {Quantity}", productId, quantity);
                throw new Exception("Stok çıkışı işlenemedi");
            }
        }

        public async Task<bool> ValidateStockMovementAsync(StockMovement stockMovement)
        {
            if (stockMovement == null)
                return false;

            try
            {
                // Ürün var mı kontrol et
                if (!stockMovement.ProductId.HasValue) return false;
                
                var product = await _productRepository.GetByIdAsync(stockMovement.ProductId.Value);
                if (product == null)
                    return false;

                // Kullanıcı var mı kontrol et (gerçek uygulamada UserRepository kullanılır)
                // var user = await _userRepository.GetUserByIdAsync(stockMovement.UserId);
                // if (user == null) return false;

                // Miktar pozitif mi
                if (stockMovement.Quantity <= 0)
                    return false;

                // Hareket türü geçerli mi
                if (stockMovement.MovementType != "in" && stockMovement.MovementType != "out")
                    return false;

                // PreviousStock ve NewStock otomatik olarak hesaplanıyor, validation gerekmiyor
                // if (stockMovement.PreviousStock < 0 || stockMovement.NewStock < 0)
                //     return false;

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareket doğrulaması yapılırken hata");
                return false;
            }
        }

        public async Task<bool> CanProcessStockOutAsync(int? productId, int quantity)
        {
            if (!productId.HasValue || productId.Value <= 0 || quantity <= 0)
                return false;

            try
            {
                var product = await _productRepository.GetByIdAsync(productId.Value);
                if (product == null)
                    return false;

                return product.StockQuantity >= quantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok çıkış kontrolü yapılırken hata: {ProductId}", productId.Value);
                return false;
            }
        }

        // İstatistikler
        public async Task<Dictionary<string, int>> GetStockMovementTypeDistributionAsync()
        {
            try
            {
                var allMovements = await _stockMovementRepository.GetAllStockMovementsWithoutNavigationAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var movement in allMovements)
                {
                    if (distribution.ContainsKey(movement.MovementType))
                        distribution[movement.MovementType]++;
                    else
                        distribution[movement.MovementType] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareket türü dağılımı hesaplanırken hata");
                throw new Exception("Stok hareket türü dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetStockMovementByProductDistributionAsync()
        {
            try
            {
                var allMovements = await _stockMovementRepository.GetAllStockMovementsWithoutNavigationAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var movement in allMovements)
                {
                    if (!movement.ProductId.HasValue) continue;
                    
                    var product = await _productRepository.GetByIdAsync(movement.ProductId.Value);
                    var productName = product?.Name ?? $"Ürün {movement.ProductId.Value}";

                    if (distribution.ContainsKey(productName))
                        distribution[productName]++;
                    else
                        distribution[productName] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stok hareket ürün dağılımı hesaplanırken hata");
                throw new Exception("Stok hareket ürün dağılımı hesaplanamadı");
            }
        }

        public async Task<decimal> GetTotalStockValueAsync()
        {
            try
            {
                var allMovements = await _stockMovementRepository.GetAllStockMovementsWithoutNavigationAsync();
                var totalValue = 0m;

                foreach (var movement in allMovements)
                {
                    if (!movement.ProductId.HasValue) continue;
                    
                    var product = await _productRepository.GetByIdAsync(movement.ProductId.Value);
                    if (product != null)
                    {
                        totalValue += product.StockQuantity * product.Price;
                    }
                }

                return totalValue;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam stok değeri hesaplanırken hata");
                throw new Exception("Toplam stok değeri hesaplanamadı");
            }
        }

        public async Task<IEnumerable<StockMovement>> GetRecentStockMovementsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var allMovements = await _stockMovementRepository.GetAllStockMovementsWithoutNavigationAsync();
                return allMovements
                    .OrderByDescending(m => m.MovementDate)
                    .Take(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son stok hareketleri getirilirken hata: {Count}", count);
                throw new Exception("Son stok hareketleri getirilemedi");
            }
        }

        // Yardımcı metodlar
        private async Task<bool> ValidateStockForMovementAsync(int? productId, int quantity, string movementType)
        {
            if (!productId.HasValue) return false;
            
            var product = await _productRepository.GetByIdAsync(productId.Value);
            if (product == null)
                return false;

            if (movementType == "out")
            {
                return product.StockQuantity >= quantity;
            }

            return true;
        }

        private async Task<decimal> CalculateTotalValueAsync(IEnumerable<StockMovement> movements)
        {
            decimal totalValue = 0;
            foreach (var movement in movements)
            {
                if (!movement.ProductId.HasValue) continue;
                
                var product = await _productRepository.GetByIdAsync(movement.ProductId.Value);
                if (product != null)
                {
                    totalValue += product.StockQuantity * product.Price;
                }
            }
            return totalValue;
        }

        private async Task UpdateProductStockAsync(int? productId, int quantity, string movementType)
        {
            if (!productId.HasValue) return;
            
            var product = await _productRepository.GetByIdAsync(productId.Value);
            if (product != null)
            {
                if (movementType == "in")
                {
                    product.StockQuantity += quantity;
                }
                else if (movementType == "out")
                {
                    product.StockQuantity -= quantity;
                    if (product.StockQuantity < 0)
                        product.StockQuantity = 0;
                }

                await _productRepository.UpdateAsync(product);
            }
        }
    }
}
