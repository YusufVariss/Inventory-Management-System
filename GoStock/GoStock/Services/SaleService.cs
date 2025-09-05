using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class SaleService : ISaleService
    {
        private readonly ISaleRepository _saleRepository;
        private readonly IProductRepository _productRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly ILogger<SaleService> _logger;

        public SaleService(
            ISaleRepository saleRepository,
            IProductRepository productRepository,
            IStockMovementRepository stockMovementRepository,
            ILogger<SaleService> logger)
        {
            _saleRepository = saleRepository;
            _productRepository = productRepository;
            _stockMovementRepository = stockMovementRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<Sale>> GetAllSalesAsync()
        {
            try
            {
                return await _saleRepository.GetAllSalesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satışlar getirilirken hata oluştu");
                throw new Exception("Satışlar getirilemedi");
            }
        }

        public async Task<Sale?> GetSaleByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz satış ID");

            try
            {
                return await _saleRepository.GetSaleByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış ID: {SaleId} getirilirken hata oluştu", id);
                throw new Exception("Satış getirilemedi");
            }
        }

        public async Task<Sale> CreateSaleAsync(Sale sale)
        {
            if (sale == null)
                throw new ArgumentNullException(nameof(sale));

            if (sale.ProductId <= 0)
                throw new ArgumentException("Ürün ID zorunludur");

            if (sale.UserId <= 0)
                throw new ArgumentException("Kullanıcı ID zorunludur");

            if (sale.Quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (sale.UnitPrice <= 0)
                throw new ArgumentException("Birim fiyat 0'dan büyük olmalıdır");

            // Satış doğrulaması
            if (!await ValidateSaleAsync(sale))
                throw new Exception("Satış doğrulanamadı");

            try
            {
                var createdSale = await _saleRepository.CreateSaleAsync(sale);
                _logger.LogInformation("Yeni satış oluşturuldu: {ProductId} - {Quantity}", sale.ProductId, sale.Quantity);
                return createdSale;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış oluşturulurken hata: {ProductId}", sale.ProductId);
                throw new Exception("Satış oluşturulamadı");
            }
        }

        public async Task<Sale> UpdateSaleAsync(Sale sale)
        {
            if (sale == null)
                throw new ArgumentNullException(nameof(sale));

            if (sale.Id <= 0)
                throw new ArgumentException("Geçersiz satış ID");

            // Satışın var olup olmadığını kontrol et
            if (!await _saleRepository.SaleExistsAsync(sale.Id))
                throw new Exception("Satış bulunamadı");

            try
            {
                var updatedSale = await _saleRepository.UpdateSaleAsync(sale);
                _logger.LogInformation("Satış güncellendi: {SaleId}", sale.Id);
                return updatedSale;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış güncellenirken hata: {SaleId}", sale.Id);
                throw new Exception("Satış güncellenemedi");
            }
        }

        public async Task<bool> DeleteSaleAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz satış ID");

            try
            {
                var result = await _saleRepository.DeleteSaleAsync(id);
                if (result)
                {
                    _logger.LogInformation("Satış silindi: {SaleId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış silinirken hata: {SaleId}", id);
                throw new Exception("Satış silinemedi");
            }
        }

        // Satış yönetimi
        public async Task<IEnumerable<Sale>> GetSalesByProductAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _saleRepository.GetSalesByProductAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün satışları getirilirken hata: {ProductId}", productId);
                throw new Exception("Ürün satışları getirilemedi");
            }
        }

        public async Task<IEnumerable<Sale>> GetSalesByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _saleRepository.GetSalesByUserAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı satışları getirilirken hata: {UserId}", userId);
                throw new Exception("Kullanıcı satışları getirilemedi");
            }
        }

        public async Task<IEnumerable<Sale>> GetSalesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _saleRepository.GetSalesByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı satışları getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı satışları getirilemedi");
            }
        }

        public async Task<IEnumerable<Sale>> GetSalesByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Durum belirtilmelidir");

            try
            {
                return await _saleRepository.GetSalesByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Durum satışları getirilirken hata: {Status}", status);
                throw new Exception("Durum satışları getirilemedi");
            }
        }

        public async Task<IEnumerable<Sale>> GetSalesByPaymentMethodAsync(string paymentMethod)
        {
            if (string.IsNullOrWhiteSpace(paymentMethod))
                throw new ArgumentException("Ödeme yöntemi belirtilmelidir");

            try
            {
                return await _saleRepository.GetSalesByPaymentMethodAsync(paymentMethod);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ödeme yöntemi satışları getirilirken hata: {PaymentMethod}", paymentMethod);
                throw new Exception("Ödeme yöntemi satışları getirilemedi");
            }
        }

        // Satış kontrolü
        public async Task<bool> SaleExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz satış ID");

            try
            {
                return await _saleRepository.SaleExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış varlık kontrolü yapılırken hata: {SaleId}", id);
                throw new Exception("Satış varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalSalesCountAsync()
        {
            try
            {
                return await _saleRepository.GetTotalSalesCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satış sayısı getirilirken hata");
                throw new Exception("Toplam satış sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetTotalSalesAmountAsync()
        {
            try
            {
                return await _saleRepository.GetTotalSalesAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satış tutarı getirilirken hata");
                throw new Exception("Toplam satış tutarı getirilemedi");
            }
        }

        public async Task<decimal> GetSalesAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _saleRepository.GetSalesAmountByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı satış tutarı hesaplanırken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı satış tutarı hesaplanamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<Sale>> GetSalesWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _saleRepository.GetSalesWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı satış listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Satış listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<Sale>> GetTopSellingProductsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                return await _saleRepository.GetTopSellingProductsAsync(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok satan ürünler getirilirken hata: {Count}", count);
                throw new Exception("En çok satan ürünler getirilemedi");
            }
        }

        // İş mantığı
        public async Task<Sale> ProcessSaleAsync(Sale sale)
        {
            if (sale == null)
                throw new ArgumentNullException(nameof(sale));

            // Satış doğrulaması
            if (!await ValidateSaleAsync(sale))
                throw new Exception("Satış doğrulanamadı");

            // Stok kontrolü
            if (!await CanProcessSaleAsync(sale.ProductId, sale.Quantity))
                throw new Exception("Yeterli stok bulunmuyor");

            try
            {
                // Toplam tutarı hesapla
                sale.TotalAmount = sale.Quantity * sale.UnitPrice;
                sale.SaleDate = DateTime.Now;
                sale.Status = "completed";

                var createdSale = await CreateSaleAsync(sale);

                // Stok çıkışı yap
                await ProcessStockOutForSaleAsync(sale.ProductId, sale.Quantity, sale.UserId, $"Satış: {createdSale.Id}");

                _logger.LogInformation("Satış işlendi: {SaleId} - {ProductId} - {Quantity}", createdSale.Id, sale.ProductId, sale.Quantity);
                
                return createdSale;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış işlenirken hata: {ProductId} - {Quantity}", sale.ProductId, sale.Quantity);
                throw new Exception("Satış işlenemedi");
            }
        }

        public async Task<bool> ValidateSaleAsync(Sale sale)
        {
            if (sale == null)
                return false;

            try
            {
                // Ürün var mı kontrol et
                var product = await _productRepository.GetByIdAsync(sale.ProductId);
                if (product == null)
                    return false;

                // Miktar pozitif mi
                if (sale.Quantity <= 0)
                    return false;

                // Birim fiyat pozitif mi
                if (sale.UnitPrice <= 0)
                    return false;

                // Stok yeterli mi
                if (product.StockQuantity < sale.Quantity)
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış doğrulaması yapılırken hata");
                return false;
            }
        }

        public async Task<bool> CanProcessSaleAsync(int productId, int quantity)
        {
            if (productId <= 0 || quantity <= 0)
                return false;

            try
            {
                var product = await _productRepository.GetByIdAsync(productId);
                if (product == null)
                    return false;

                return product.StockQuantity >= quantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış işlenebilirlik kontrolü yapılırken hata: {ProductId}", productId);
                return false;
            }
        }

        public async Task<bool> UpdateSaleStatusAsync(int saleId, string status)
        {
            if (saleId <= 0)
                throw new ArgumentException("Geçersiz satış ID");

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Durum belirtilmelidir");

            try
            {
                var sale = await _saleRepository.GetSaleByIdAsync(saleId);
                if (sale == null)
                    return false;

                sale.Status = status;
                await _saleRepository.UpdateSaleAsync(sale);
                
                _logger.LogInformation("Satış durumu güncellendi: {SaleId} - {Status}", saleId, status);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış durumu güncellenirken hata: {SaleId} - {Status}", saleId, status);
                throw new Exception("Satış durumu güncellenemedi");
            }
        }

        // İstatistikler
        public async Task<decimal> GetAverageSaleAmountAsync()
        {
            try
            {
                return await _saleRepository.GetAverageSaleAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama satış tutarı hesaplanırken hata");
                throw new Exception("Ortalama satış tutarı hesaplanamadı");
            }
        }

        public async Task<int> GetTotalItemsSoldAsync()
        {
            try
            {
                return await _saleRepository.GetTotalItemsSoldAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satılan ürün sayısı hesaplanırken hata");
                throw new Exception("Toplam satılan ürün sayısı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetSalesStatusDistributionAsync()
        {
            try
            {
                var allSales = await _saleRepository.GetAllSalesAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var sale in allSales)
                {
                    if (distribution.ContainsKey(sale.Status))
                        distribution[sale.Status]++;
                    else
                        distribution[sale.Status] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış durumu dağılımı hesaplanırken hata");
                throw new Exception("Satış durumu dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, decimal>> GetSalesByPaymentMethodDistributionAsync()
        {
            try
            {
                var allSales = await _saleRepository.GetAllSalesAsync();
                var distribution = new Dictionary<string, decimal>();

                foreach (var sale in allSales)
                {
                    var paymentMethod = sale.PaymentMethod ?? "Unknown";
                    if (distribution.ContainsKey(paymentMethod))
                        distribution[paymentMethod] += sale.TotalAmount;
                    else
                        distribution[paymentMethod] = sale.TotalAmount;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış ödeme yöntemi dağılımı hesaplanırken hata");
                throw new Exception("Satış ödeme yöntemi dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<Sale>> GetRecentSalesAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var allSales = await _saleRepository.GetAllSalesAsync();
                return allSales
                    .OrderByDescending(s => s.SaleDate)
                    .Take(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son satışlar getirilirken hata: {Count}", count);
                throw new Exception("Son satışlar getirilemedi");
            }
        }

        // Yardımcı metodlar
        private async Task ProcessStockOutForSaleAsync(int productId, int quantity, int userId, string notes)
        {
            try
            {
                var stockMovement = new StockMovement
                {
                    ProductId = productId,
                    UserId = userId,
                    Quantity = quantity,
                    MovementType = "out",
                    Notes = notes,
                    MovementDate = DateTime.Now
                };

                await _stockMovementRepository.CreateStockMovementAsync(stockMovement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satış için stok çıkışı yapılırken hata: {ProductId}", productId);
                throw new Exception("Satış için stok çıkışı yapılamadı");
            }
        }

        private async Task<bool> CheckStockAvailabilityAsync(int productId, int quantity)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
                return false;

            return product.StockQuantity >= quantity;
        }

        private async Task<bool> ValidateProductForSaleAsync(int productId, int quantity)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
                return false;

            if (product.StockQuantity < quantity)
                return false;

            return true;
        }
    }
}
