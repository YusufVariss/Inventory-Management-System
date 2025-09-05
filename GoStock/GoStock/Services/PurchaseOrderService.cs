using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly IPurchaseOrderRepository _purchaseOrderRepository;
        private readonly ISupplierRepository _supplierRepository;
        private readonly ILogger<PurchaseOrderService> _logger;

        public PurchaseOrderService(
            IPurchaseOrderRepository purchaseOrderRepository,
            ISupplierRepository supplierRepository,
            ILogger<PurchaseOrderService> logger)
        {
            _purchaseOrderRepository = purchaseOrderRepository;
            _supplierRepository = supplierRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<PurchaseOrder>> GetAllPurchaseOrdersAsync()
        {
            try
            {
                return await _purchaseOrderRepository.GetAllPurchaseOrdersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişleri getirilirken hata oluştu");
                throw new Exception("Satın alma siparişleri getirilemedi");
            }
        }

        public async Task<PurchaseOrder?> GetPurchaseOrderByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrderByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi ID: {PurchaseOrderId} getirilirken hata oluştu", id);
                throw new Exception("Satın alma siparişi getirilemedi");
            }
        }

        public async Task<PurchaseOrder> CreatePurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            if (purchaseOrder == null)
                throw new ArgumentNullException(nameof(purchaseOrder));

            if (purchaseOrder.SupplierId <= 0)
                throw new ArgumentException("Tedarikçi ID zorunludur");

            if (purchaseOrder.UserId <= 0)
                throw new ArgumentException("Kullanıcı ID zorunludur");

            if (string.IsNullOrWhiteSpace(purchaseOrder.OrderNumber))
                throw new ArgumentException("Sipariş numarası zorunludur");

            if (purchaseOrder.TotalAmount <= 0)
                throw new ArgumentException("Toplam tutar 0'dan büyük olmalıdır");

            // Sipariş doğrulaması
            if (!await ValidatePurchaseOrderAsync(purchaseOrder))
                throw new Exception("Satın alma siparişi doğrulanamadı");

            try
            {
                var createdOrder = await _purchaseOrderRepository.CreatePurchaseOrderAsync(purchaseOrder);
                _logger.LogInformation("Yeni satın alma siparişi oluşturuldu: {OrderNumber}", purchaseOrder.OrderNumber);
                return createdOrder;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi oluşturulurken hata: {OrderNumber}", purchaseOrder.OrderNumber);
                throw new Exception("Satın alma siparişi oluşturulamadı");
            }
        }

        public async Task<PurchaseOrder> UpdatePurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            if (purchaseOrder == null)
                throw new ArgumentNullException(nameof(purchaseOrder));

            if (purchaseOrder.Id <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            if (!await _purchaseOrderRepository.PurchaseOrderExistsAsync(purchaseOrder.Id))
                throw new Exception("Satın alma siparişi bulunamadı");

            try
            {
                var updatedOrder = await _purchaseOrderRepository.UpdatePurchaseOrderAsync(purchaseOrder);
                _logger.LogInformation("Satın alma siparişi güncellendi: {PurchaseOrderId}", purchaseOrder.Id);
                return updatedOrder;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi güncellenirken hata: {PurchaseOrderId}", purchaseOrder.Id);
                throw new Exception("Satın alma siparişi güncellenemedi");
            }
        }

        public async Task<bool> DeletePurchaseOrderAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            try
            {
                var result = await _purchaseOrderRepository.DeletePurchaseOrderAsync(id);
                if (result)
                {
                    _logger.LogInformation("Satın alma siparişi silindi: {PurchaseOrderId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi silinirken hata: {PurchaseOrderId}", id);
                throw new Exception("Satın alma siparişi silinemedi");
            }
        }

        // Sipariş yönetimi
        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersBySupplierAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersBySupplierAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi siparişleri getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi siparişleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersByUserAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı siparişleri getirilirken hata: {UserId}", userId);
                throw new Exception("Kullanıcı siparişleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı siparişleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı siparişleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Durum belirtilmelidir");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Durum siparişleri getirilirken hata: {Status}", status);
                throw new Exception("Durum siparişleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByOrderNumberAsync(string orderNumber)
        {
            if (string.IsNullOrWhiteSpace(orderNumber))
                throw new ArgumentException("Sipariş numarası belirtilmelidir");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersByOrderNumberAsync(orderNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sipariş numarası siparişleri getirilirken hata: {OrderNumber}", orderNumber);
                throw new Exception("Sipariş numarası siparişleri getirilemedi");
            }
        }

        // Sipariş kontrolü
        public async Task<bool> PurchaseOrderExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            try
            {
                return await _purchaseOrderRepository.PurchaseOrderExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi varlık kontrolü yapılırken hata: {PurchaseOrderId}", id);
                throw new Exception("Satın alma siparişi varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalPurchaseOrdersCountAsync()
        {
            try
            {
                return await _purchaseOrderRepository.GetTotalPurchaseOrdersCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satın alma sipariş sayısı getirilirken hata");
                throw new Exception("Toplam satın alma sipariş sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetTotalPurchaseOrdersAmountAsync()
        {
            try
            {
                return await _purchaseOrderRepository.GetTotalPurchaseOrdersAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam satın alma sipariş tutarı getirilirken hata");
                throw new Exception("Toplam satın alma sipariş tutarı getirilemedi");
            }
        }

        public async Task<decimal> GetPurchaseOrdersAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersAmountByDateRangeAsync(startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı sipariş tutarı hesaplanırken hata: {StartDate} - {EndDate}", startDate, endDate);
                throw new Exception("Tarih aralığı sipariş tutarı hesaplanamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _purchaseOrderRepository.GetPurchaseOrdersWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı sipariş listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Sipariş listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetTopSuppliersByOrdersAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                return await _purchaseOrderRepository.GetTopSuppliersByOrdersAsync(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok sipariş veren tedarikçiler getirilirken hata: {Count}", count);
                throw new Exception("En çok sipariş veren tedarikçiler getirilemedi");
            }
        }

        // İş mantığı
        public async Task<PurchaseOrder> ProcessPurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            if (purchaseOrder == null)
                throw new ArgumentNullException(nameof(purchaseOrder));

            if (!await ValidatePurchaseOrderAsync(purchaseOrder))
                throw new Exception("Satın alma siparişi doğrulanamadı");

            try
            {
                purchaseOrder.OrderDate = DateTime.Now;
                purchaseOrder.Status = "pending";

                var createdOrder = await CreatePurchaseOrderAsync(purchaseOrder);

                _logger.LogInformation("Satın alma siparişi işlendi: {OrderId} - {OrderNumber}", createdOrder.Id, purchaseOrder.OrderNumber);
                
                return createdOrder;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi işlenirken hata: {OrderNumber}", purchaseOrder.OrderNumber);
                throw new Exception("Satın alma siparişi işlenemedi");
            }
        }

        public async Task<bool> ValidatePurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            if (purchaseOrder == null)
                return false;

            try
            {
                // Tedarikçi var mı kontrol et
                var supplier = await _supplierRepository.GetSupplierByIdAsync(purchaseOrder.SupplierId);
                if (supplier == null)
                    return false;

                // Tedarikçi aktif mi
                if (!supplier.IsActive)
                    return false;

                // Toplam tutar pozitif mi
                if (purchaseOrder.TotalAmount <= 0)
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi doğrulaması yapılırken hata");
                return false;
            }
        }

        public async Task<bool> CanProcessPurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            if (purchaseOrder == null)
                return false;

            try
            {
                return await ValidatePurchaseOrderAsync(purchaseOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi işlenebilirlik kontrolü yapılırken hata");
                return false;
            }
        }

        public async Task<bool> UpdatePurchaseOrderStatusAsync(int purchaseOrderId, string status)
        {
            if (purchaseOrderId <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Durum belirtilmelidir");

            try
            {
                var order = await _purchaseOrderRepository.GetPurchaseOrderByIdAsync(purchaseOrderId);
                if (order == null)
                    return false;

                order.Status = status;
                await _purchaseOrderRepository.UpdatePurchaseOrderAsync(order);
                
                _logger.LogInformation("Satın alma siparişi durumu güncellendi: {PurchaseOrderId} - {Status}", purchaseOrderId, status);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi durumu güncellenirken hata: {PurchaseOrderId} - {Status}", purchaseOrderId, status);
                throw new Exception("Satın alma siparişi durumu güncellenemedi");
            }
        }

        public async Task<bool> ApprovePurchaseOrderAsync(int purchaseOrderId, int approverId)
        {
            if (purchaseOrderId <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            if (approverId <= 0)
                throw new ArgumentException("Geçersiz onaylayıcı ID");

            try
            {
                var order = await _purchaseOrderRepository.GetPurchaseOrderByIdAsync(purchaseOrderId);
                if (order == null)
                    return false;

                order.Status = "approved";
                order.ApprovedBy = approverId;
                order.ApprovedDate = DateTime.Now;
                await _purchaseOrderRepository.UpdatePurchaseOrderAsync(order);
                
                _logger.LogInformation("Satın alma siparişi onaylandı: {PurchaseOrderId} - {ApproverId}", purchaseOrderId, approverId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi onaylanırken hata: {PurchaseOrderId}", purchaseOrderId);
                throw new Exception("Satın alma siparişi onaylanamadı");
            }
        }

        public async Task<bool> RejectPurchaseOrderAsync(int purchaseOrderId, int rejectorId, string reason)
        {
            if (purchaseOrderId <= 0)
                throw new ArgumentException("Geçersiz sipariş ID");

            if (rejectorId <= 0)
                throw new ArgumentException("Geçersiz reddeden ID");

            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("Red nedeni belirtilmelidir");

            try
            {
                var order = await _purchaseOrderRepository.GetPurchaseOrderByIdAsync(purchaseOrderId);
                if (order == null)
                    return false;

                order.Status = "rejected";
                order.RejectedBy = rejectorId;
                order.RejectedDate = DateTime.Now;
                order.RejectionReason = reason;
                await _purchaseOrderRepository.UpdatePurchaseOrderAsync(order);
                
                _logger.LogInformation("Satın alma siparişi reddedildi: {PurchaseOrderId} - {RejectorId}", purchaseOrderId, rejectorId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma siparişi reddedilirken hata: {PurchaseOrderId}", purchaseOrderId);
                throw new Exception("Satın alma siparişi reddedilemedi");
            }
        }

        // İstatistikler
        public async Task<decimal> GetAveragePurchaseOrderAmountAsync()
        {
            try
            {
                return await _purchaseOrderRepository.GetAveragePurchaseOrderAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama satın alma sipariş tutarı hesaplanırken hata");
                throw new Exception("Ortalama satın alma sipariş tutarı hesaplanamadı");
            }
        }

        public async Task<int> GetTotalItemsOrderedAsync()
        {
            try
            {
                return await _purchaseOrderRepository.GetTotalItemsOrderedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam sipariş edilen ürün sayısı hesaplanırken hata");
                throw new Exception("Toplam sipariş edilen ürün sayısı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetPurchaseOrderStatusDistributionAsync()
        {
            try
            {
                var allOrders = await _purchaseOrderRepository.GetAllPurchaseOrdersAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var order in allOrders)
                {
                    if (distribution.ContainsKey(order.Status))
                        distribution[order.Status]++;
                    else
                        distribution[order.Status] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma sipariş durumu dağılımı hesaplanırken hata");
                throw new Exception("Satın alma sipariş durumu dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, decimal>> GetPurchaseOrdersBySupplierDistributionAsync()
        {
            try
            {
                var allOrders = await _purchaseOrderRepository.GetAllPurchaseOrdersAsync();
                var distribution = new Dictionary<string, decimal>();

                foreach (var order in allOrders)
                {
                    var supplier = await _supplierRepository.GetSupplierByIdAsync(order.SupplierId);
                    var supplierName = supplier?.Name ?? $"Tedarikçi {order.SupplierId}";

                    if (distribution.ContainsKey(supplierName))
                        distribution[supplierName] += order.TotalAmount;
                    else
                        distribution[supplierName] = order.TotalAmount;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Satın alma sipariş tedarikçi dağılımı hesaplanırken hata");
                throw new Exception("Satın alma sipariş tedarikçi dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetRecentPurchaseOrdersAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var allOrders = await _purchaseOrderRepository.GetAllPurchaseOrdersAsync();
                return allOrders
                    .OrderByDescending(o => o.OrderDate)
                    .Take(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son satın alma siparişleri getirilirken hata: {Count}", count);
                throw new Exception("Son satın alma siparişleri getirilemedi");
            }
        }
    }
}
