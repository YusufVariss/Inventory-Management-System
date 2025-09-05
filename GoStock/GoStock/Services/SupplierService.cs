using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _supplierRepository;
        private readonly ILogger<SupplierService> _logger;

        public SupplierService(ISupplierRepository supplierRepository, ILogger<SupplierService> logger)
        {
            _supplierRepository = supplierRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<Supplier>> GetAllSuppliersAsync()
        {
            try
            {
                return await _supplierRepository.GetAllSuppliersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçiler getirilirken hata oluştu");
                throw new Exception("Tedarikçiler getirilemedi");
            }
        }

        public async Task<Supplier?> GetSupplierByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _supplierRepository.GetSupplierByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi ID: {SupplierId} getirilirken hata oluştu", id);
                throw new Exception("Tedarikçi getirilemedi");
            }
        }

        public async Task<Supplier?> GetSupplierByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tedarikçi adı boş olamaz");

            try
            {
                return await _supplierRepository.GetSupplierByNameAsync(name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi adı: {Name} getirilirken hata oluştu", name);
                throw new Exception("Tedarikçi getirilemedi");
            }
        }

        public async Task<Supplier> CreateSupplierAsync(Supplier supplier)
        {
            if (supplier == null)
                throw new ArgumentNullException(nameof(supplier));

            if (string.IsNullOrWhiteSpace(supplier.Name))
                throw new ArgumentException("Tedarikçi adı zorunludur");

            if (string.IsNullOrWhiteSpace(supplier.Email))
                throw new ArgumentException("Email adresi zorunludur");

            // Tedarikçi adı benzersizlik kontrolü
            if (await _supplierRepository.SupplierNameExistsAsync(supplier.Name))
                throw new Exception("Bu tedarikçi adı zaten kullanılıyor");

            try
            {
                var createdSupplier = await _supplierRepository.CreateSupplierAsync(supplier);
                _logger.LogInformation("Yeni tedarikçi oluşturuldu: {Name}", supplier.Name);
                return createdSupplier;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi oluşturulurken hata: {Name}", supplier.Name);
                throw new Exception("Tedarikçi oluşturulamadı");
            }
        }

        public async Task<Supplier> UpdateSupplierAsync(Supplier supplier)
        {
            if (supplier == null)
                throw new ArgumentNullException(nameof(supplier));

            if (supplier.Id <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            if (string.IsNullOrWhiteSpace(supplier.Name))
                throw new ArgumentException("Tedarikçi adı zorunludur");

            // Tedarikçi adı benzersizlik kontrolü (kendisi hariç)
            var existingSupplier = await _supplierRepository.GetSupplierByNameAsync(supplier.Name);
            if (existingSupplier != null && existingSupplier.Id != supplier.Id)
                throw new Exception("Bu tedarikçi adı zaten kullanılıyor");

            // Tedarikçinin var olup olmadığını kontrol et
            if (!await _supplierRepository.SupplierExistsAsync(supplier.Id))
                throw new Exception("Tedarikçi bulunamadı");

            try
            {
                var updatedSupplier = await _supplierRepository.UpdateSupplierAsync(supplier);
                _logger.LogInformation("Tedarikçi güncellendi: {SupplierId} - {Name}", supplier.Id, supplier.Name);
                return updatedSupplier;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi güncellenirken hata: {SupplierId}", supplier.Id);
                throw new Exception("Tedarikçi güncellenemedi");
            }
        }

        public async Task<bool> DeleteSupplierAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                // Tedarikçide aktif sipariş var mı kontrol et
                if (await _supplierRepository.GetSupplierPurchaseOrderCountAsync(id) > 0)
                    throw new Exception("Bu tedarikçide aktif siparişler bulunduğu için silinemez");

                var result = await _supplierRepository.DeleteSupplierAsync(id);
                if (result)
                {
                    _logger.LogInformation("Tedarikçi silindi: {SupplierId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi silinirken hata: {SupplierId}", id);
                throw new Exception("Tedarikçi silinemedi");
            }
        }

        // Tedarikçi yönetimi
        public async Task<IEnumerable<Supplier>> GetActiveSuppliersAsync()
        {
            try
            {
                return await _supplierRepository.GetActiveSuppliersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif tedarikçiler getirilirken hata");
                throw new Exception("Aktif tedarikçiler getirilemedi");
            }
        }

        public async Task<bool> ActivateSupplierAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                var supplier = await _supplierRepository.GetSupplierByIdAsync(id);
                if (supplier == null)
                    return false;

                supplier.IsActive = true;
                await _supplierRepository.UpdateSupplierAsync(supplier);
                
                _logger.LogInformation("Tedarikçi aktif edildi: {SupplierId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi aktif edilirken hata: {SupplierId}", id);
                throw new Exception("Tedarikçi aktif edilemedi");
            }
        }

        public async Task<bool> DeactivateSupplierAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                var supplier = await _supplierRepository.GetSupplierByIdAsync(id);
                if (supplier == null)
                    return false;

                supplier.IsActive = false;
                await _supplierRepository.UpdateSupplierAsync(supplier);
                
                _logger.LogInformation("Tedarikçi deaktif edildi: {SupplierId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi deaktif edilirken hata: {SupplierId}", id);
                throw new Exception("Tedarikçi deaktif edilemedi");
            }
        }

        public async Task<bool> IsSupplierNameUniqueAsync(string name, int? excludeSupplierId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tedarikçi adı belirtilmelidir");

            try
            {
                var existingSupplier = await _supplierRepository.GetSupplierByNameAsync(name);
                if (existingSupplier == null)
                    return true;

                // Belirli bir tedarikçi hariç tutuluyorsa
                if (excludeSupplierId.HasValue && existingSupplier.Id == excludeSupplierId.Value)
                    return true;

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi adı benzersizlik kontrolü yapılırken hata: {Name}", name);
                throw new Exception("Tedarikçi adı kontrolü yapılamadı");
            }
        }

        // Sipariş yönetimi
        public async Task<IEnumerable<PurchaseOrder>> GetSupplierPurchaseOrdersAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _supplierRepository.GetSupplierPurchaseOrdersAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi siparişleri getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi siparişleri getirilemedi");
            }
        }

        public async Task<IEnumerable<PurchaseOrder>> GetSupplierOrdersAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _supplierRepository.GetSupplierPurchaseOrdersAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi siparişleri getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi siparişleri getirilemedi");
            }
        }

        public async Task<int> GetSupplierPurchaseOrderCountAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _supplierRepository.GetSupplierPurchaseOrderCountAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi sipariş sayısı getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi sipariş sayısı getirilemedi");
            }
        }

        public async Task<int> GetSupplierOrderCountAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _supplierRepository.GetSupplierPurchaseOrderCountAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi sipariş sayısı getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi sipariş sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetSupplierTotalSpentAsync(int supplierId)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            try
            {
                return await _supplierRepository.GetSupplierTotalSpentAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi toplam harcaması getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi toplam harcaması getirilemedi");
            }
        }

        public async Task<decimal> GetSupplierTotalSpentByDateRangeAsync(int supplierId, DateTime startDate, DateTime endDate)
        {
            if (supplierId <= 0)
                throw new ArgumentException("Geçersiz tedarikçi ID");

            if (startDate > endDate)
                throw new ArgumentException("Başlangıç tarihi bitiş tarihinden büyük olamaz");

            try
            {
                var purchaseOrders = await _supplierRepository.GetSupplierPurchaseOrdersAsync(supplierId);
                return purchaseOrders
                    .Where(po => po.OrderDate >= startDate && po.OrderDate <= endDate && po.Status == "delivered")
                    .Sum(po => po.TotalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi tarih aralığı harcaması hesaplanırken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi tarih aralığı harcaması hesaplanamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<Supplier>> SearchSuppliersAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllSuppliersAsync();

            try
            {
                var allSuppliers = await _supplierRepository.GetAllSuppliersAsync();
                return allSuppliers.Where(s => 
                    s.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    s.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    s.Phone?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true ||
                    s.Address?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi arama hatası: {SearchTerm}", searchTerm);
                throw new Exception("Tedarikçi arama yapılamadı");
            }
        }

        public async Task<IEnumerable<Supplier>> GetSuppliersWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _supplierRepository.GetSuppliersWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı tedarikçi listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Tedarikçi listesi getirilemedi");
            }
        }

        public async Task<int> GetTotalSuppliersCountAsync()
        {
            try
            {
                return await _supplierRepository.GetTotalSuppliersCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam tedarikçi sayısı getirilirken hata");
                throw new Exception("Toplam tedarikçi sayısı getirilemedi");
            }
        }

        // İstatistikler
        public async Task<Dictionary<string, decimal>> GetSupplierSpendingDistributionAsync()
        {
            try
            {
                var suppliers = await _supplierRepository.GetAllSuppliersAsync();
                var distribution = new Dictionary<string, decimal>();

                foreach (var supplier in suppliers)
                {
                    var totalSpent = await _supplierRepository.GetSupplierTotalSpentAsync(supplier.Id);
                    var supplierName = supplier.Name ?? "Unknown";
                    distribution[supplierName] = totalSpent;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi harcama dağılımı hesaplanırken hata");
                throw new Exception("Tedarikçi harcama dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<Supplier>> GetTopSuppliersBySpendingAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var suppliers = await _supplierRepository.GetAllSuppliersAsync();
                var supplierSpending = new List<(Supplier Supplier, decimal TotalSpent)>();

                foreach (var supplier in suppliers)
                {
                    var totalSpent = await _supplierRepository.GetSupplierTotalSpentAsync(supplier.Id);
                    supplierSpending.Add((supplier, totalSpent));
                }

                return supplierSpending
                    .OrderByDescending(x => x.TotalSpent)
                    .Take(count)
                    .Select(x => x.Supplier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "En çok harcama yapan tedarikçiler getirilirken hata: {Count}", count);
                throw new Exception("En çok harcama yapan tedarikçiler getirilemedi");
            }
        }

        public async Task<decimal> GetAverageSupplierSpendingAsync()
        {
            try
            {
                var suppliers = await _supplierRepository.GetAllSuppliersAsync();
                if (!suppliers.Any())
                    return 0;

                var totalSpending = 0m;
                foreach (var supplier in suppliers)
                {
                    totalSpending += await _supplierRepository.GetSupplierTotalSpentAsync(supplier.Id);
                }

                return totalSpending / suppliers.Count();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortalama tedarikçi harcaması hesaplanırken hata");
                throw new Exception("Ortalama tedarikçi harcaması hesaplanamadı");
            }
        }

        public async Task<int> GetSuppliersWithActiveOrdersCountAsync()
        {
            try
            {
                var suppliers = await _supplierRepository.GetAllSuppliersAsync();
                var count = 0;

                foreach (var supplier in suppliers)
                {
                    var orderCount = await _supplierRepository.GetSupplierPurchaseOrderCountAsync(supplier.Id);
                    if (orderCount > 0)
                        count++;
                }

                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif siparişi olan tedarikçi sayısı hesaplanırken hata");
                throw new Exception("Aktif siparişi olan tedarikçi sayısı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<Product>> GetSupplierProductsAsync(int supplierId)
        {
            try
            {
                return await _supplierRepository.GetSupplierProductsAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi ürünleri getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi ürünleri getirilemedi");
            }
        }

        public async Task<int> GetSupplierProductCountAsync(int supplierId)
        {
            try
            {
                return await _supplierRepository.GetSupplierProductCountAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi ürün sayısı getirilirken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi ürün sayısı getirilemedi");
            }
        }

        public async Task<decimal> GetSupplierTotalValueAsync(int supplierId)
        {
            try
            {
                return await _supplierRepository.GetSupplierTotalValueAsync(supplierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tedarikçi toplam değeri hesaplanırken hata: {SupplierId}", supplierId);
                throw new Exception("Tedarikçi toplam değeri hesaplanamadı");
            }
        }

        public async Task<Supplier?> GetSupplierByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("E-posta adresi boş olamaz");

            try
            {
                return await _supplierRepository.GetSupplierByEmailAsync(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "E-posta ile tedarikçi getirilirken hata: {Email}", email);
                throw new Exception("Tedarikçi getirilemedi");
            }
        }
    }
}
