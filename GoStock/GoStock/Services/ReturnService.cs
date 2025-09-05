using GoStock.Repositories;
using GoStock.Models;
using GoStock.Services;
using System.Text.Json;

namespace GoStock.Services
{
    public class ReturnService : IReturnService
    {
        private readonly IReturnRepository _returnRepository;
        private readonly ISaleRepository _saleRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IStockMovementService _stockMovementService;
        private readonly IProductRepository _productRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<ReturnService> _logger;

        public ReturnService(
            IReturnRepository returnRepository,
            ISaleRepository saleRepository,
            IStockMovementRepository stockMovementRepository,
            IStockMovementService stockMovementService,
            IProductRepository productRepository,
            IUserRepository userRepository,
            IAuditLogService auditLogService,
            ILogger<ReturnService> logger)
        {
            _returnRepository = returnRepository;
            _saleRepository = saleRepository;
            _stockMovementRepository = stockMovementRepository;
            _stockMovementService = stockMovementService;
            _productRepository = productRepository;
            _userRepository = userRepository;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<Return>> GetAllReturnsAsync()
        {
            try
            {
                return await _returnRepository.GetAllReturnsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İadeler getirilirken hata oluştu");
                throw new Exception("İadeler getirilemedi");
            }
        }

        public async Task<Return?> GetReturnByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            try
            {
                return await _returnRepository.GetReturnByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade ID: {ReturnId} getirilirken hata oluştu", id);
                throw new Exception("İade getirilemedi");
            }
        }

        public async Task<Return> CreateReturnAsync(Return returnItem)
        {
            if (returnItem == null)
                throw new ArgumentNullException(nameof(returnItem));

            if (string.IsNullOrWhiteSpace(returnItem.ProductName))
                throw new ArgumentException("Ürün adı zorunludur");

            if (string.IsNullOrWhiteSpace(returnItem.UserFullName))
                throw new ArgumentException("Kullanıcı adı zorunludur");

            if (returnItem.Quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (string.IsNullOrWhiteSpace(returnItem.Reason))
                throw new ArgumentException("İade nedeni zorunludur");

            // İade doğrulaması
            if (!await ValidateReturnAsync(returnItem))
                throw new Exception("İade doğrulanamadı");

            try
            {
                // Ürünün birim fiyatını bul ve toplam tutarı hesapla
                var products = await _productRepository.SearchAsync(returnItem.ProductName);
                var product = products.FirstOrDefault(p => p.Name.Equals(returnItem.ProductName, StringComparison.OrdinalIgnoreCase));
                
                if (product != null)
                {
                    // Miktar × birim fiyat = toplam tutar
                    returnItem.Amount = returnItem.Quantity * product.Price;
                    _logger.LogInformation("İade tutarı hesaplandı: {Quantity} × {Price} = {Amount}", 
                        returnItem.Quantity, product.Price, returnItem.Amount);
                }
                else
                {
                    _logger.LogWarning("Ürün bulunamadı, tutar hesaplanamadı: {ProductName}", returnItem.ProductName);
                    returnItem.Amount = 0; // Ürün bulunamazsa 0 olarak ayarla
                }

                var createdReturn = await _returnRepository.CreateReturnAsync(returnItem);
                _logger.LogInformation("Yeni iade oluşturuldu: {ProductName} - {Quantity} - {Amount}", 
                    returnItem.ProductName, returnItem.Quantity, returnItem.Amount);
                
                // AuditLog kaydı ekle
                try
                {
                    var auditLog = new AuditLog
                    {
                        TableName = "Returns",
                        EntityName = $"İade - {returnItem.ReturnType}",
                        RecordId = createdReturn.Id,
                        EntityId = createdReturn.Id,
                        Action = "INSERT",
                        Severity = "Info",
                        Timestamp = DateTime.Now,
                        UserId = 1, // Şimdilik default user ID
                        Details = JsonSerializer.Serialize(new
                        {
                            ProductName = returnItem.ProductName,
                            ProductId = product?.Id, // Ürün ID'sini de ekle
                            Quantity = returnItem.Quantity,
                            ReturnType = returnItem.ReturnType,
                            Reason = returnItem.Reason,
                            Amount = returnItem.Amount,
                            UserFullName = returnItem.UserFullName,
                            Action = "INSERT",
                            Message = "Yeni iade kaydı oluşturuldu"
                        })
                    };

                    await _auditLogService.CreateAuditLogAsync(auditLog);
                }
                catch (Exception ex)
                {
                    // AuditLog hatası iade oluşturmayı engellemesin
                    _logger.LogWarning(ex, "Audit log kaydı oluşturulamadı");
                }
                
                return createdReturn;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade oluşturulurken hata: {ProductName}", returnItem.ProductName);
                throw new Exception("İade oluşturulamadı");
            }
        }

        public async Task<Return> UpdateReturnAsync(Return returnItem)
        {
            if (returnItem == null)
                throw new ArgumentNullException(nameof(returnItem));

            if (returnItem.Id <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            if (!await _returnRepository.ReturnExistsAsync(returnItem.Id))
                throw new Exception("İade bulunamadı");

            try
            {
                // Ürünün birim fiyatını bul ve toplam tutarı yeniden hesapla
                var products = await _productRepository.SearchAsync(returnItem.ProductName);
                var product = products.FirstOrDefault(p => p.Name.Equals(returnItem.ProductName, StringComparison.OrdinalIgnoreCase));
                
                if (product != null)
                {
                    // Miktar × birim fiyat = toplam tutar
                    returnItem.Amount = returnItem.Quantity * product.Price;
                    _logger.LogInformation("İade tutarı güncellendi: {Quantity} × {Price} = {Amount}", 
                        returnItem.Quantity, product.Price, returnItem.Amount);
                }
                else
                {
                    _logger.LogWarning("Ürün bulunamadı, tutar hesaplanamadı: {ProductName}", returnItem.ProductName);
                    returnItem.Amount = 0; // Ürün bulunamazsa 0 olarak ayarla
                }

                var updatedReturn = await _returnRepository.UpdateReturnAsync(returnItem);
                _logger.LogInformation("İade güncellendi: {ReturnId} - {Amount}", returnItem.Id, returnItem.Amount);
                
                // AuditLog kaydı ekle
                try
                {
                    var auditLog = new AuditLog
                    {
                        TableName = "Returns",
                        EntityName = $"İade - {returnItem.ReturnType}",
                        RecordId = updatedReturn.Id,
                        EntityId = updatedReturn.Id,
                        Action = "UPDATE",
                        Severity = "Info",
                        Timestamp = DateTime.Now,
                        UserId = 1, // Şimdilik default user ID
                        Details = JsonSerializer.Serialize(new
                        {
                            ProductName = returnItem.ProductName,
                            ProductId = product?.Id, // Ürün ID'sini de ekle
                            Quantity = returnItem.Quantity,
                            ReturnType = returnItem.ReturnType,
                            Reason = returnItem.Reason,
                            Amount = returnItem.Amount,
                            UserFullName = returnItem.UserFullName,
                            Action = "UPDATE",
                            Message = "İade kaydı güncellendi"
                        })
                    };

                    await _auditLogService.CreateAuditLogAsync(auditLog);
                }
                catch (Exception ex)
                {
                    // AuditLog hatası iade güncellemeyi engellemesin
                    _logger.LogWarning(ex, "Audit log kaydı oluşturulamadı");
                }
                
                return updatedReturn;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade güncellenirken hata: {ReturnId}", returnItem.Id);
                throw new Exception("İade güncellenemedi");
            }
        }

        public async Task<bool> DeleteReturnAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            try
            {
                var result = await _returnRepository.DeleteReturnAsync(id);
                if (result)
                {
                    _logger.LogInformation("İade silindi: {ReturnId}", id);
                    
                    // AuditLog kaydı ekle
                    try
                    {
                        var auditLog = new AuditLog
                        {
                            TableName = "Returns",
                            EntityName = "İade Silindi",
                            RecordId = id,
                            EntityId = id,
                            Action = "DELETE",
                            Severity = "Info",
                            Timestamp = DateTime.Now,
                            UserId = 1, // Şimdilik default user ID
                            Details = JsonSerializer.Serialize(new 
                            { 
                                ReturnId = id,
                                Action = "DELETE",
                                Message = "İade kaydı silindi"
                            })
                        };

                        await _auditLogService.CreateAuditLogAsync(auditLog);
                    }
                    catch (Exception ex)
                    {
                        // AuditLog hatası iade silmeyi engellemesin
                        _logger.LogWarning(ex, "Audit log kaydı oluşturulamadı");
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade silinirken hata: {ReturnId}", id);
                throw new Exception("İade silinemedi");
            }
        }

        // İade yönetimi
        public async Task<IEnumerable<Return>> GetReturnsByProductAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _returnRepository.GetReturnsByProductAsync(productId.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün iadeleri getirilirken hata: {ProductId}", productId);
                throw new Exception("Ürün iadeleri getirilemedi");
            }
        }

        public async Task<IEnumerable<Return>> GetReturnsBySaleAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _returnRepository.GetReturnsBySaleAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün iadeleri getirilirken hata: {ProductId}", productId);
                throw new Exception("Ürün iadeleri getirilemedi");
            }
        }

        public async Task<IEnumerable<Return>> GetReturnsByUserAsync(string userFullName)
        {
            if (string.IsNullOrWhiteSpace(userFullName))
                throw new ArgumentException("Geçersiz kullanıcı adı");

            try
            {
                return await _returnRepository.GetReturnsByUserAsync(userFullName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı iadeleri getirilirken hata: {UserFullName}", userFullName);
                throw new Exception("Kullanıcı iadeleri getirilemedi");
            }
        }

        public async Task<IEnumerable<Return>> GetReturnsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _returnRepository.GetReturnsByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı iadeleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı iadeleri getirilemedi");
            }
        }

        public async Task<IEnumerable<Return>> GetReturnsByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Durum belirtilmelidir");

            try
            {
                return await _returnRepository.GetReturnsByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Durum iadeleri getirilirken hata: {Status}", status);
                throw new Exception("Durum iadeleri getirilemedi");
            }
        }

        public async Task<IEnumerable<Return>> GetReturnsByReasonAsync(string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("Neden belirtilmelidir");

            try
            {
                return await _returnRepository.GetReturnsByReasonAsync(reason);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Neden iadeleri getirilirken hata: {Reason}", reason);
                throw new Exception("Neden iadeleri getirilemedi");
            }
        }

        // İade kontrolü
        public async Task<bool> ReturnExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            try
            {
                return await _returnRepository.ReturnExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade varlık kontrolü yapılırken hata: {ReturnId}", id);
                throw new Exception("İade varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalReturnsCountAsync()
        {
            try
            {
                return await _returnRepository.GetTotalReturnsCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam iade sayısı getirilirken hata");
                throw new Exception("Toplam iade sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetTotalReturnsAmountAsync()
        {
            try
            {
                return await _returnRepository.GetTotalReturnsAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam iade tutarı getirilirken hata");
                throw new Exception("Toplam iade tutarı getirilemedi");
            }
        }

        public async Task<decimal> GetReturnsAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _returnRepository.GetReturnsAmountByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı iade tutarı hesaplanırken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı iade tutarı hesaplanamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<Return>> GetReturnsWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _returnRepository.GetReturnsWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı iade listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("İade listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<Return>> GetTopReturnedProductsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                return await _returnRepository.GetTopReturnedProductsAsync(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok iade edilen ürünler getirilirken hata: {Count}", count);
                throw new Exception("En çok iade edilen ürünler getirilemedi");
            }
        }

        // İş mantığı
        public async Task<Return> ProcessReturnAsync(Return returnItem)
        {
            if (returnItem == null)
                throw new ArgumentNullException(nameof(returnItem));

            if (!await ValidateReturnAsync(returnItem))
                throw new Exception("İade doğrulanamadı");

            try
            {
                returnItem.ReturnDate = DateTime.Now;
                returnItem.Status = "pending";

                var createdReturn = await CreateReturnAsync(returnItem);

                // İade oluşturulduğunda stok hareketi yapılmaz
                // Stok hareketi sadece iade onaylandığında yapılır

                _logger.LogInformation("İade işlendi: {ReturnId} - {ProductName} - {Quantity}", createdReturn.Id, returnItem.ProductName, returnItem.Quantity);
                
                return createdReturn;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade işlenirken hata: {ProductName} - {Quantity}", returnItem.ProductName, returnItem.Quantity);
                throw new Exception("İade işlenemedi");
            }
        }

        public async Task<bool> ValidateReturnAsync(Return returnItem)
        {
            if (returnItem == null)
                return false;

            try
            {
                // Ürün var mı kontrol et
                if (string.IsNullOrWhiteSpace(returnItem.ProductName))
                    return false;

                // Miktar pozitif mi
                if (returnItem.Quantity <= 0)
                    return false;

                // İade miktarı kontrolü - şimdilik basit kontrol
                // Daha detaylı kontrol için ProductRepository kullanılabilir

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade doğrulaması yapılırken hata");
                return false;
            }
        }

        public async Task<bool> CanProcessReturnAsync(int productId, int quantity)
        {
            if (productId <= 0 || quantity <= 0)
                return false;

            try
            {
                // Ürün var mı kontrol et - bu basit bir kontrol
                // Daha detaylı kontrol için ProductRepository kullanılabilir
                return true; // Şimdilik her zaman true döndürüyoruz
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade işlenebilirlik kontrolü yapılırken hata: {ProductId}", productId);
                return false;
            }
        }

        public async Task<bool> UpdateReturnStatusAsync(int returnId, string status)
        {
            if (returnId <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Durum belirtilmelidir");

            try
            {
                var returnItem = await _returnRepository.GetReturnByIdAsync(returnId);
                if (returnItem == null)
                    return false;

                returnItem.Status = status;
                await _returnRepository.UpdateReturnAsync(returnItem);
                
                _logger.LogInformation("İade durumu güncellendi: {ReturnId} - {Status}", returnId, status);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade durumu güncellenirken hata: {ReturnId} - {Status}", returnId, status);
                throw new Exception("İade durumu güncellenemedi");
            }
        }

        public async Task<bool> ApproveReturnAsync(int returnId)
        {
            if (returnId <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            try
            {
                var returnItem = await _returnRepository.GetReturnByIdAsync(returnId);
                if (returnItem == null)
                    return false;

                // Sadece pending durumundaki iadeler onaylanabilir
                if (returnItem.Status != "pending")
                {
                    _logger.LogWarning("İade onaylanamadı - mevcut durum: {Status}, ID: {ReturnId}", returnItem.Status, returnId);
                    return false;
                }

                // İade durumunu approved olarak güncelle
                returnItem.Status = "approved";
                returnItem.ProcessedDate = DateTime.Now;
                await _returnRepository.UpdateReturnAsync(returnItem);

                // Stoktan düş - iade miktarı kadar stok çıkışı yap
                await ProcessStockOutForApprovedReturnAsync(returnItem.ProductName, returnItem.Quantity, returnItem.UserFullName, $"Onaylanan İade: {returnId}");

                _logger.LogInformation("İade onaylandı ve stoktan düşüldü: {ReturnId} - {ProductName} - {Quantity}", returnId, returnItem.ProductName, returnItem.Quantity);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade onaylanırken hata: {ReturnId}", returnId);
                throw new Exception("İade onaylanamadı");
            }
        }

        public async Task<bool> RejectReturnAsync(int returnId)
        {
            if (returnId <= 0)
                throw new ArgumentException("Geçersiz iade ID");

            try
            {
                var returnItem = await _returnRepository.GetReturnByIdAsync(returnId);
                if (returnItem == null)
                    return false;

                // Sadece pending durumundaki iadeler reddedilebilir
                if (returnItem.Status != "pending")
                {
                    _logger.LogWarning("İade reddedilemedi - mevcut durum: {Status}, ID: {ReturnId}", returnItem.Status, returnId);
                    return false;
                }

                // İade durumunu rejected olarak güncelle
                returnItem.Status = "rejected";
                returnItem.ProcessedDate = DateTime.Now;
                await _returnRepository.UpdateReturnAsync(returnItem);

                _logger.LogInformation("İade reddedildi: {ReturnId} - {ProductName}", returnId, returnItem.ProductName);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade reddedilirken hata: {ReturnId}", returnId);
                throw new Exception("İade reddedilemedi");
            }
        }

        // İstatistikler
        public async Task<decimal> GetAverageReturnAmountAsync()
        {
            try
            {
                return await _returnRepository.GetAverageReturnAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama iade tutarı hesaplanırken hata");
                throw new Exception("Ortalama iade tutarı hesaplanamadı");
            }
        }

        public async Task<int> GetTotalItemsReturnedAsync()
        {
            try
            {
                return await _returnRepository.GetTotalItemsReturnedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam iade edilen ürün sayısı hesaplanırken hata");
                throw new Exception("Toplam iade edilen ürün sayısı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetReturnsStatusDistributionAsync()
        {
            try
            {
                var allReturns = await _returnRepository.GetAllReturnsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var returnItem in allReturns)
                {
                    if (distribution.ContainsKey(returnItem.Status))
                        distribution[returnItem.Status]++;
                    else
                        distribution[returnItem.Status] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade durumu dağılımı hesaplanırken hata");
                throw new Exception("İade durumu dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetReturnsByReasonDistributionAsync()
        {
            try
            {
                var allReturns = await _returnRepository.GetAllReturnsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var returnItem in allReturns)
                {
                    if (distribution.ContainsKey(returnItem.Reason))
                        distribution[returnItem.Reason]++;
                    else
                        distribution[returnItem.Reason] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İade neden dağılımı hesaplanırken hata");
                throw new Exception("İade neden dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<Return>> GetRecentReturnsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var allReturns = await _returnRepository.GetAllReturnsAsync();
                return allReturns
                    .OrderByDescending(r => r.ReturnDate)
                    .Take(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son iadeler getirilirken hata: {Count}", count);
                throw new Exception("Son iadeler getirilemedi");
            }
        }

        // Yardımcı metodlar

        private async Task ProcessStockOutForApprovedReturnAsync(string productName, int quantity, string userFullName, string notes)
        {
            try
            {
                _logger.LogInformation("Stok çıkışı işlemi başlatılıyor: {ProductName} - {Quantity} - {UserFullName}", productName, quantity, userFullName);

                // ProductName'den ProductId'yi bul
                var products = await _productRepository.SearchAsync(productName);
                _logger.LogInformation("Arama sonucu {Count} ürün bulundu", products.Count());
                
                var product = products.FirstOrDefault(p => p.Name.Equals(productName, StringComparison.OrdinalIgnoreCase));
                if (product == null)
                {
                    _logger.LogWarning("Ürün bulunamadı: {ProductName}", productName);
                    throw new Exception($"Ürün bulunamadı: {productName}");
                }

                _logger.LogInformation("Ürün bulundu: {ProductId} - {ProductName}", product.Id, product.Name);

                // UserFullName'den UserId'yi bul
                var users = await _userRepository.GetAllUsersAsync();
                var user = users.FirstOrDefault(u => u.FullName.Equals(userFullName, StringComparison.OrdinalIgnoreCase));
                if (user == null)
                {
                    _logger.LogWarning("Kullanıcı bulunamadı: {UserFullName}, admin user kullanılacak", userFullName);
                    // Kullanıcı bulunamazsa admin user'ı kullan
                    user = await _userRepository.GetUserByIdAsync(1);
                }

                _logger.LogInformation("Kullanıcı bulundu: {UserId} - {UserFullName}", user?.Id, user?.FullName);

                // Ürün stok miktarını güncelle
                product.StockQuantity -= quantity;
                if (product.StockQuantity < 0)
                    product.StockQuantity = 0;

                await _productRepository.UpdateAsync(product);

                // İade için stok hareketi oluştur (istatistikler için)
                var stockMovement = new StockMovement
                {
                    ProductId = product.Id,
                    UserId = user?.Id ?? 1,
                    Quantity = quantity,
                    MovementType = "out", // Stok çıkışı - istatistikler için
                    Notes = $"İade Onayı: {productName} - {notes} - {userFullName}",
                    MovementDate = DateTime.Now
                };

                await _stockMovementService.CreateStockMovementAsync(stockMovement);
                
                _logger.LogInformation("İade onaylandı - ürün stok miktarı güncellendi ve stok hareketi oluşturuldu: {ProductName} - {Quantity} - Yeni Stok: {NewStock}", 
                    productName, quantity, product.StockQuantity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Onaylanan iade için stok çıkışı yapılırken hata: {ProductName} - {Quantity} - {UserFullName}", productName, quantity, userFullName);
                throw new Exception("Onaylanan iade için stok çıkışı yapılamadı");
            }
        }
    }
}
