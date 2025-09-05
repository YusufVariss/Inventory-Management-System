using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IPurchaseOrderItemRepository
    {
        Task<IEnumerable<PurchaseOrderItem>> GetAllPurchaseOrderItemsAsync();
        Task<PurchaseOrderItem?> GetPurchaseOrderItemByIdAsync(int id);
        Task<IEnumerable<PurchaseOrderItem>> GetPurchaseOrderItemsByOrderAsync(int purchaseOrderId);
        Task<IEnumerable<PurchaseOrderItem>> GetPurchaseOrderItemsByProductAsync(int productId);
        Task<PurchaseOrderItem> CreatePurchaseOrderItemAsync(PurchaseOrderItem purchaseOrderItem);
        Task<PurchaseOrderItem> UpdatePurchaseOrderItemAsync(PurchaseOrderItem purchaseOrderItem);
        Task<bool> DeletePurchaseOrderItemAsync(int id);
        Task<bool> PurchaseOrderItemExistsAsync(int id);
        Task<int> GetTotalPurchaseOrderItemsCountAsync();
        Task<IEnumerable<PurchaseOrderItem>> GetPurchaseOrderItemsWithPaginationAsync(int page, int pageSize);
        Task<decimal> GetTotalPurchaseOrderItemsValueAsync();
        Task<decimal> GetPurchaseOrderItemsValueByOrderAsync(int purchaseOrderId);
        Task<int> GetTotalQuantityByProductAsync(int productId);
        Task<decimal> GetAverageUnitPriceByProductAsync(int productId);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsByStatusAsync(string status);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsByPurchaseOrderAsync(int purchaseOrderId);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsByProductAsync(int productId);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsBySupplierAsync(int supplierId);
        Task<int> GetTotalItemsCountAsync();
        Task<decimal> GetTotalItemsValueAsync();
        Task<int> GetItemsCountByPurchaseOrderAsync(int purchaseOrderId);
        Task<IEnumerable<PurchaseOrderItem>> GetItemsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<PurchaseOrderItem>> GetTopOrderedProductsAsync(int count);
        Task<decimal> GetAverageItemPriceAsync();
    }
}
