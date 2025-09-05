using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class PurchaseOrderItemService : IPurchaseOrderItemService
    {
        private readonly IPurchaseOrderItemRepository _purchaseOrderItemRepository;
        private readonly IPurchaseOrderRepository _purchaseOrderRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger<PurchaseOrderItemService> _logger;

        public PurchaseOrderItemService(
            IPurchaseOrderItemRepository purchaseOrderItemRepository,
            IPurchaseOrderRepository purchaseOrderRepository,
            IProductRepository productRepository,
            ILogger<PurchaseOrderItemService> logger)
        {
            _purchaseOrderItemRepository = purchaseOrderItemRepository;
            _purchaseOrderRepository = purchaseOrderRepository;
            _productRepository = productRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<PurchaseOrderItem>> GetAllPurchaseOrderItemsAsync()
        {
            try
            {
                return await _purchaseOrderItemRepository.GetAllPurchaseOrderItemsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemleri getirilirken hata oluştu");
                throw new Exception("Sipariş kalemleri getirilemedi");
            }
        }

        public async Task<PurchaseOrderItem?> GetPurchaseOrderItemByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz sipariş kalemi ID");

            try
            {
                return await _purchaseOrderItemRepository.GetPurchaseOrderItemByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi ID: {ItemId} getirilirken hata oluştu", id);
                throw new Exception("Sipariş kalemi getirilemedi");
            }
        }

        public async Task<PurchaseOrderItem> CreatePurchaseOrderItemAsync(PurchaseOrderItem item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (item.PurchaseOrderId <= 0)
                throw new ArgumentException("Sipariş ID zorunludur");

            if (item.ProductId <= 0)
                throw new ArgumentException("Ürün ID zorunludur");

            if (item.Quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (item.UnitPrice <= 0)
                throw new ArgumentException("Birim fiyat 0'dan büyük olmalıdır");

            // Sipariş kalemi doğrulaması
            if (!await ValidatePurchaseOrderItemAsync(item))
                throw new Exception("Sipariş kalemi doğrulanamadı");

            try
            {
                // Toplam tutarı hesapla
                item.TotalPrice = await CalculateItemTotalAsync(item.Quantity, item.UnitPrice);

                var createdItem = await _purchaseOrderItemRepository.CreatePurchaseOrderItemAsync(item);
                _logger.LogInformation("Yeni sipariş kalemi oluşturuldu: {ProductId} - {Quantity}", item.ProductId, item.Quantity);
                return createdItem;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi oluşturulurken hata: {ProductId}", item.ProductId);
                throw new Exception("Sipariş kalemi oluşturulamadı");
            }
        }

        public async Task<PurchaseOrderItem> UpdatePurchaseOrderItemAsync(PurchaseOrderItem item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (item.Id <= 0)
                throw new ArgumentException("Geçersiz sipariş kalemi ID");

            if (!await _purchaseOrderItemRepository.PurchaseOrderItemExistsAsync(item.Id))
                throw new Exception("Sipariş kalemi bulunamadı");

            try
            {
                // Toplam tutarı güncelle
                item.TotalPrice = await CalculateItemTotalAsync(item.Quantity, item.UnitPrice);

                var updatedItem = await _purchaseOrderItemRepository.UpdatePurchaseOrderItemAsync(item);
                _logger.LogInformation("Sipariş kalemi güncellendi: {ItemId}", item.Id);
                return updatedItem;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi güncellenirken hata: {ItemId}", item.Id);
                throw new Exception("Sipariş kalemi güncellenemedi");
            }
        }

        public async Task<bool> DeletePurchaseOrderItemAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz sipariş kalemi ID");

            try
            {
                var result = await _purchaseOrderItemRepository.DeletePurchaseOrderItemAsync(id);
                if (result)
                {
                    _logger.LogInformation("Sipariş kalemi silindi: {ItemId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi silinirken hata: {ItemId}", id);
                throw new Exception("Sipariş kalemi silinemedi");
            }
        }

        // Sipariş kalemi yönetimi
        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsByPurchaseOrderAsync(int purchaseOrderId)
        {
            if (purchaseOrderId <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            try
            {
                return await _purchaseOrderItemRepository.GetItemsByPurchaseOrderAsync(purchaseOrderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemleri getirilirken hata: {PurchaseOrderId}", purchaseOrderId);
                throw new Exception("Sipariş kalemleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsByProductAsync(int productId)
        {
            if (productId <= 0)
                throw new ArgumentException("Geçersiz ürün ID");

            try
            {
                return await _purchaseOrderItemRepository.GetItemsByProductAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün sipariş kalemleri getirilirken hata: {ProductId}", productId);
                throw new Exception("Ürün sipariş kalemleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsBySupplierAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _purchaseOrderItemRepository.GetItemsBySupplierAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi sipariş kalemleri getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi sipariş kalemleri getirilemedi");
            }
        }

        // Sipariş kalemi kontrolü
        public async Task<bool> PurchaseOrderItemExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz sipariş kalemi ID");

            try
            {
                return await _purchaseOrderItemRepository.PurchaseOrderItemExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi varlık kontrolü yapılırken hata: {ItemId}", id);
                throw new Exception("Sipariş kalemi varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalItemsCountAsync()
        {
            try
            {
                return await _purchaseOrderItemRepository.GetTotalItemsCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam sipariş kalemi sayısı getirilirken hata");
                throw new Exception("Toplam sipariş kalemi sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetTotalItemsValueAsync()
        {
            try
            {
                return await _purchaseOrderItemRepository.GetTotalItemsValueAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam sipariş kalemi değeri getirilirken hata");
                throw new Exception("Toplam sipariş kalemi değeri getirilemedi");
            }
        }

        public async Task<int> GetItemsCountByPurchaseOrderAsync(int purchaseOrderId)
        {
            if (purchaseOrderId <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            try
            {
                return await _purchaseOrderItemRepository.GetItemsCountByPurchaseOrderAsync(purchaseOrderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi sayısı getirilirken hata: {PurchaseOrderId}", purchaseOrderId);
                throw new Exception("Sipariş kalemi sayısı getirilemedi");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _purchaseOrderItemRepository.GetItemsWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı sipariş kalemi listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Sipariş kalemi listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetTopOrderedProductsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                return await _purchaseOrderItemRepository.GetTopOrderedProductsAsync(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok sipariş edilen ürünler getirilirken hata: {Count}", count);
                throw new Exception("En çok sipariş edilen ürünler getirilemedi");
            }
        }

        // İş mantığı
        public async Task<PurchaseOrderItem> ProcessPurchaseOrderItemAsync(PurchaseOrderItem item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!await ValidatePurchaseOrderItemAsync(item))
                throw new Exception("Sipariş kalemi doğrulanamadı");

            try
            {
                var createdItem = await CreatePurchaseOrderItemAsync(item);

                _logger.LogInformation("Sipariş kalemi işlendi: {ItemId} - {ProductId} - {Quantity}", 
                    createdItem.Id, item.ProductId, item.Quantity);
                
                return createdItem;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi işlenirken hata: {ProductId} - {Quantity}", item.ProductId, item.Quantity);
                throw new Exception("Sipariş kalemi işlenemedi");
            }
        }

        public async Task<bool> ValidatePurchaseOrderItemAsync(PurchaseOrderItem item)
        {
            if (item == null)
                return false;

            try
            {
                // Sipariş var mı kontrol et
                var purchaseOrder = await _purchaseOrderRepository.GetPurchaseOrderByIdAsync(item.PurchaseOrderId);
                if (purchaseOrder == null)
                    return false;

                // Ürün var mı kontrol et
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    return false;

                // Miktar pozitif mi
                if (item.Quantity <= 0)
                    return false;

                // Birim fiyat pozitif mi
                if (item.UnitPrice <= 0)
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi doğrulaması yapılırken hata");
                return false;
            }
        }

        public async Task<bool> CanProcessPurchaseOrderItemAsync(PurchaseOrderItem item)
        {
            if (item == null)
                return false;

            try
            {
                return await ValidatePurchaseOrderItemAsync(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi işlenebilirlik kontrolü yapılırken hata");
                return false;
            }
        }

        public Task<decimal> CalculateItemTotalAsync(int quantity, decimal unitPrice)
        {
            if (quantity <= 0)
                throw new ArgumentException("Miktar 0'dan büyük olmalıdır");

            if (unitPrice <= 0)
                throw new ArgumentException("Birim fiyat 0'dan büyük olmalıdır");

            try
            {
                return Task.FromResult(quantity * unitPrice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi toplam tutarı hesaplanırken hata: {Quantity} - {UnitPrice}", quantity, unitPrice);
                throw new Exception("Sipariş kalemi toplam tutarı hesaplanamadı");
            }
        }

        // İstatistikler
        public async Task<decimal> GetAverageItemPriceAsync()
        {
            try
            {
                return await _purchaseOrderItemRepository.GetAverageItemPriceAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama sipariş kalemi fiyatı hesaplanırken hata");
                throw new Exception("Ortalama sipariş kalemi fiyatı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetItemsByProductDistributionAsync()
        {
            try
            {
                var allItems = await _purchaseOrderItemRepository.GetAllPurchaseOrderItemsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var item in allItems)
                {
                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    var productName = product?.Name ?? $"Ürün {item.ProductId}";

                    if (distribution.ContainsKey(productName))
                        distribution[productName] += item.Quantity;
                    else
                        distribution[productName] = item.Quantity;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi ürün dağılımı hesaplanırken hata");
                throw new Exception("Sipariş kalemi ürün dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, decimal>> GetItemsBySupplierDistributionAsync()
        {
            try
            {
                var allItems = await _purchaseOrderItemRepository.GetAllPurchaseOrderItemsAsync();
                var distribution = new Dictionary<string, decimal>();

                foreach (var item in allItems)
                {
                    var purchaseOrder = await _purchaseOrderRepository.GetPurchaseOrderByIdAsync(item.PurchaseOrderId);
                    if (purchaseOrder != null)
                    {
                        var supplierName = $"Tedarikçi {purchaseOrder.SupplierId}";

                        if (distribution.ContainsKey(supplierName))
                            distribution[supplierName] += item.TotalPrice;
                        else
                            distribution[supplierName] = item.TotalPrice;
                    }
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş kalemi tedarikçi dağılımı hesaplanırken hata");
                throw new Exception("Sipariş kalemi tedarikçi dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetRecentItemsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var allItems = await _purchaseOrderItemRepository.GetAllPurchaseOrderItemsAsync();
                return allItems
                    .OrderByDescending(i => i.Id)
                    .Take(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son sipariş kalemleri getirilirken hata: {Count}", count);
                throw new Exception("Son sipariş kalemleri getirilemedi");
            }
        }

        private async Task<bool> ValidateProductForPurchaseOrderAsync(int productId, int quantity)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
                return false;

            if (quantity <= 0)
                return false;

            return true;
        }
    }
}
