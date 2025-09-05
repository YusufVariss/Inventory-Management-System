using GoStock.Models;

namespace GoStock.Services
{
    public interface ISupplierService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<Supplier>> GetAllSuppliersAsync();
        Task<Supplier?> GetSupplierByIdAsync(int id);
        Task<Supplier?> GetSupplierByNameAsync(string name);
        Task<Supplier?> GetSupplierByEmailAsync(string email);
        Task<Supplier> CreateSupplierAsync(Supplier supplier);
        Task<Supplier> UpdateSupplierAsync(Supplier supplier);
        Task<bool> DeleteSupplierAsync(int id);
        
        // Tedarikçi yönetimi
        Task<IEnumerable<Supplier>> GetActiveSuppliersAsync();
        Task<bool> ActivateSupplierAsync(int id);
        Task<bool> DeactivateSupplierAsync(int id);
        Task<bool> IsSupplierNameUniqueAsync(string name, int? excludeSupplierId = null);
        
        // Sipariş yönetimi
        Task<IEnumerable<PurchaseOrder>> GetSupplierPurchaseOrdersAsync(int supplierId);
        Task<IEnumerable<PurchaseOrder>> GetSupplierOrdersAsync(int supplierId);
        Task<int> GetSupplierPurchaseOrderCountAsync(int supplierId);
        Task<int> GetSupplierOrderCountAsync(int supplierId);
        Task<decimal> GetSupplierTotalSpentAsync(int supplierId);
        Task<IEnumerable<Product>> GetSupplierProductsAsync(int supplierId);
        Task<int> GetSupplierProductCountAsync(int supplierId);
        Task<decimal> GetSupplierTotalValueAsync(int supplierId);
        Task<decimal> GetSupplierTotalSpentByDateRangeAsync(int supplierId, DateTime startDate, DateTime endDate);
        
        // Arama ve filtreleme
        Task<IEnumerable<Supplier>> SearchSuppliersAsync(string searchTerm);
        Task<IEnumerable<Supplier>> GetSuppliersWithPaginationAsync(int page, int pageSize);
        Task<int> GetTotalSuppliersCountAsync();
        
        // İstatistikler
        Task<Dictionary<string, decimal>> GetSupplierSpendingDistributionAsync();
        Task<IEnumerable<Supplier>> GetTopSuppliersBySpendingAsync(int count);
        Task<decimal> GetAverageSupplierSpendingAsync();
        Task<int> GetSuppliersWithActiveOrdersCountAsync();
    }
}
