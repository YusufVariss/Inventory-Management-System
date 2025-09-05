using GoStock.Models;

namespace GoStock.Repositories
{
    public interface ISupplierRepository
    {
        Task<IEnumerable<Supplier>> GetAllSuppliersAsync();
        Task<Supplier?> GetSupplierByIdAsync(int id);
        Task<Supplier?> GetSupplierByNameAsync(string name);
        Task<IEnumerable<Supplier>> GetActiveSuppliersAsync();
        Task<Supplier> CreateSupplierAsync(Supplier supplier);
        Task<Supplier> UpdateSupplierAsync(Supplier supplier);
        Task<bool> DeleteSupplierAsync(int id);
        Task<bool> SupplierExistsAsync(int id);
        Task<bool> SupplierNameExistsAsync(string name);
        Task<int> GetTotalSuppliersCountAsync();
        Task<IEnumerable<Supplier>> GetSuppliersWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<PurchaseOrder>> GetSupplierPurchaseOrdersAsync(int supplierId);
        Task<int> GetSupplierPurchaseOrderCountAsync(int supplierId);
        Task<decimal> GetSupplierTotalSpentAsync(int supplierId);
        Task<decimal> GetSupplierTotalSpentByDateRangeAsync(int supplierId, DateTime startDate, DateTime endDate);
        Task<Supplier?> GetSupplierByEmailAsync(string email);
        Task<IEnumerable<Product>> GetSupplierProductsAsync(int supplierId);
        Task<int> GetSupplierProductCountAsync(int supplierId);
        Task<decimal> GetSupplierTotalValueAsync(int supplierId);
    }
}
