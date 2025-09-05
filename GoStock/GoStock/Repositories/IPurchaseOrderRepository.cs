using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IPurchaseOrderRepository
    {
        Task<IEnumerable<PurchaseOrder>> GetAllPurchaseOrdersAsync();
        Task<PurchaseOrder?> GetPurchaseOrderByIdAsync(int id);
        Task<PurchaseOrder?> GetPurchaseOrderByOrderNumberAsync(string orderNumber);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersBySupplierAsync(int supplierId);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByStatusAsync(string status);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByUserAsync(int userId);
        Task<PurchaseOrder> CreatePurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<PurchaseOrder> UpdatePurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<bool> DeletePurchaseOrderAsync(int id);
        Task<bool> PurchaseOrderExistsAsync(int id);
        Task<bool> OrderNumberExistsAsync(string orderNumber);
        Task<int> GetTotalPurchaseOrdersCountAsync();
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersWithPaginationAsync(int page, int pageSize);
        Task<decimal> GetTotalPurchaseOrdersAmountAsync();
        Task<decimal> GetPurchaseOrdersAmountByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<PurchaseOrder>> GetPendingPurchaseOrdersAsync();
        Task<IEnumerable<PurchaseOrder>> GetOverduePurchaseOrdersAsync();
        Task<int> GetPurchaseOrdersCountByStatusAsync(string status);
        Task<decimal> GetAveragePurchaseOrderAmountAsync();
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByOrderNumberAsync(string orderNumber);
        Task<IEnumerable<PurchaseOrder>> GetTopSuppliersByOrdersAsync(int count);
        Task<int> GetTotalItemsOrderedAsync();
    }
}
