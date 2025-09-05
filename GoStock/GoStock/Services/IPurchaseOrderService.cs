using GoStock.Models;

namespace GoStock.Services
{
    public interface IPurchaseOrderService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<PurchaseOrder>> GetAllPurchaseOrdersAsync();
        Task<PurchaseOrder?> GetPurchaseOrderByIdAsync(int id);
        Task<PurchaseOrder> CreatePurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<PurchaseOrder> UpdatePurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<bool> DeletePurchaseOrderAsync(int id);
        
        // Sipariş yönetimi
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersBySupplierAsync(int supplierId);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByUserAsync(int userId);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByStatusAsync(string status);
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByOrderNumberAsync(string orderNumber);
        
        // Sipariş kontrolü
        Task<bool> PurchaseOrderExistsAsync(int id);
        Task<int> GetTotalPurchaseOrdersCountAsync();
        Task<decimal> GetTotalPurchaseOrdersAmountAsync();
        Task<decimal> GetPurchaseOrdersAmountByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        // Arama ve filtreleme
        Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<PurchaseOrder>> GetTopSuppliersByOrdersAsync(int count);
        
        // İş mantığı
        Task<PurchaseOrder> ProcessPurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<bool> ValidatePurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<bool> CanProcessPurchaseOrderAsync(PurchaseOrder purchaseOrder);
        Task<bool> UpdatePurchaseOrderStatusAsync(int purchaseOrderId, string status);
        Task<bool> ApprovePurchaseOrderAsync(int purchaseOrderId, int approverId);
        Task<bool> RejectPurchaseOrderAsync(int purchaseOrderId, int rejectorId, string reason);
        
        // İstatistikler
        Task<decimal> GetAveragePurchaseOrderAmountAsync();
        Task<int> GetTotalItemsOrderedAsync();
        Task<Dictionary<string, int>> GetPurchaseOrderStatusDistributionAsync();
        Task<Dictionary<string, decimal>> GetPurchaseOrdersBySupplierDistributionAsync();
        Task<IEnumerable<PurchaseOrder>> GetRecentPurchaseOrdersAsync(int count);
    }
}
