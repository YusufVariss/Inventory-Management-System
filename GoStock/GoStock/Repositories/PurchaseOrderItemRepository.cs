using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class PurchaseOrderItemRepository : IPurchaseOrderItemRepository
    {
        private readonly GoStockDbContext _context;

        public PurchaseOrderItemRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetAllPurchaseOrderItemsAsync()
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .ToListAsync();
        }

        public async Task<PurchaseOrderItem?> GetPurchaseOrderItemByIdAsync(int id)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .FirstOrDefaultAsync(poi => poi.Id == id);
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetPurchaseOrderItemsByOrderAsync(int purchaseOrderId)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .Where(poi => poi.PurchaseOrderId == purchaseOrderId)
                .OrderBy(poi => poi.Id)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetPurchaseOrderItemsByProductAsync(int productId)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .Where(poi => poi.ProductId == productId)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .ToListAsync();
        }

        public async Task<PurchaseOrderItem> CreatePurchaseOrderItemAsync(PurchaseOrderItem purchaseOrderItem)
        {
            _context.PurchaseOrderItems.Add(purchaseOrderItem);
            await _context.SaveChangesAsync();
            
            return purchaseOrderItem;
        }

        public async Task<PurchaseOrderItem> UpdatePurchaseOrderItemAsync(PurchaseOrderItem purchaseOrderItem)
        {
            _context.PurchaseOrderItems.Update(purchaseOrderItem);
            await _context.SaveChangesAsync();
            
            return purchaseOrderItem;
        }

        public async Task<bool> DeletePurchaseOrderItemAsync(int id)
        {
            var purchaseOrderItem = await _context.PurchaseOrderItems.FindAsync(id);
            if (purchaseOrderItem == null)
                return false;

            _context.PurchaseOrderItems.Remove(purchaseOrderItem);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> PurchaseOrderItemExistsAsync(int id)
        {
            return await _context.PurchaseOrderItems.AnyAsync(poi => poi.Id == id);
        }

        public async Task<int> GetTotalPurchaseOrderItemsCountAsync()
        {
            return await _context.PurchaseOrderItems.CountAsync();
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetPurchaseOrderItemsWithPaginationAsync(int page, int pageSize)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalPurchaseOrderItemsValueAsync()
        {
            return await _context.PurchaseOrderItems
                .Where(poi => poi.PurchaseOrder.Status == "delivered")
                .SumAsync(poi => poi.Quantity * poi.UnitPrice);
        }

        public async Task<decimal> GetPurchaseOrderItemsValueByOrderAsync(int purchaseOrderId)
        {
            return await _context.PurchaseOrderItems
                .Where(poi => poi.PurchaseOrderId == purchaseOrderId)
                .SumAsync(poi => poi.Quantity * poi.UnitPrice);
        }

        public async Task<int> GetTotalQuantityByProductAsync(int productId)
        {
            return await _context.PurchaseOrderItems
                .Where(poi => poi.ProductId == productId && poi.PurchaseOrder.Status == "delivered")
                .SumAsync(poi => poi.Quantity);
        }

        public async Task<decimal> GetAverageUnitPriceByProductAsync(int productId)
        {
            var items = await _context.PurchaseOrderItems
                .Where(poi => poi.ProductId == productId && poi.PurchaseOrder.Status == "delivered")
                .ToListAsync();

            if (!items.Any())
                return 0;

            return items.Average(poi => poi.UnitPrice);
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsByStatusAsync(string status)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .Where(poi => poi.PurchaseOrder.Status == status)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsByPurchaseOrderAsync(int purchaseOrderId)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .Where(poi => poi.PurchaseOrderId == purchaseOrderId)
                .OrderBy(poi => poi.Id)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsByProductAsync(int productId)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .Where(poi => poi.ProductId == productId)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsBySupplierAsync(int supplierId)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .Where(poi => poi.PurchaseOrder.SupplierId == supplierId)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .ToListAsync();
        }

        public async Task<int> GetTotalItemsCountAsync()
        {
            return await _context.PurchaseOrderItems
                .SumAsync(poi => poi.Quantity);
        }

        public async Task<decimal> GetTotalItemsValueAsync()
        {
            return await _context.PurchaseOrderItems
                .SumAsync(poi => poi.Quantity * poi.UnitPrice);
        }

        public async Task<int> GetItemsCountByPurchaseOrderAsync(int purchaseOrderId)
        {
            return await _context.PurchaseOrderItems
                .Where(poi => poi.PurchaseOrderId == purchaseOrderId)
                .SumAsync(poi => poi.Quantity);
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetItemsWithPaginationAsync(int page, int pageSize)
        {
            return await _context.PurchaseOrderItems
                .Include(poi => poi.PurchaseOrder)
                .Include(poi => poi.Product)
                .OrderByDescending(poi => poi.PurchaseOrder.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrderItem>> GetTopOrderedProductsAsync(int count)
        {
            return await _context.PurchaseOrderItems
                .GroupBy(poi => poi.ProductId)
                .Select(g => new { ProductId = g.Key, TotalQuantity = g.Sum(poi => poi.Quantity) })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(count)
                .Join(_context.PurchaseOrderItems, x => x.ProductId, poi => poi.ProductId, (x, poi) => poi)
                .Include(poi => poi.Product)
                .ToListAsync();
        }

        public async Task<decimal> GetAverageItemPriceAsync()
        {
            return await _context.PurchaseOrderItems
                .AverageAsync(poi => poi.UnitPrice);
        }
    }
}
