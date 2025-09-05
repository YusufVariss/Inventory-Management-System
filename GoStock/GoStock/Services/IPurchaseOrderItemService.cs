using GoStock.Models;

namespace GoStock.Services
{
    public interface IPurchaseOrderItemService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<PurchaseOrderItem>> GetAllPurchaseOrderItemsAsync();
        Task<PurchaseOrderItem?> GetPurchaseOrderItemByIdAsync(int id);
        Task<PurchaseOrderItem> CreatePurchaseOrderItemAsync(PurchaseOrderItem item);
        Task<PurchaseOrderItem> UpdatePurchaseOrderItemAsync(PurchaseOrderItem item);
        Task<bool> DeletePurchaseOrderItemAsync(int id);
        
        // Sipariş kalemi yönetimi
        Task<IEnumerable<PurchaseOrderItem>> GetItemsByPurchaseOrderAsync(int purchaseOrderId);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsByProductAsync(int productId);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsBySupplierAsync(int supplierId);
        
        // Sipariş kalemi kontrolü
        Task<bool> PurchaseOrderItemExistsAsync(int id);
        Task<int> GetTotalItemsCountAsync();
        Task<decimal> GetTotalItemsValueAsync();
        Task<int> GetItemsCountByPurchaseOrderAsync(int purchaseOrderId);
        
        // Arama ve filtreleme
        Task<IEnumerable<PurchaseOrderItem>> GetItemsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<PurchaseOrderItem>> GetTopOrderedProductsAsync(int count);
        
        // İş mantığı
        Task<PurchaseOrderItem> ProcessPurchaseOrderItemAsync(PurchaseOrderItem item);
        Task<bool> ValidatePurchaseOrderItemAsync(PurchaseOrderItem item);
        Task<bool> CanProcessPurchaseOrderItemAsync(PurchaseOrderItem item);
        Task<decimal> CalculateItemTotalAsync(int quantity, decimal unitPrice);
        
        // İstatistikler
        Task<decimal> GetAverageItemPriceAsync();
        Task<Dictionary<string, int>> GetItemsByProductDistributionAsync();
        Task<Dictionary<string, decimal>> GetItemsBySupplierDistributionAsync();
        Task<IEnumerable<PurchaseOrderItem>> GetRecentItemsAsync(int count);
    }
}
