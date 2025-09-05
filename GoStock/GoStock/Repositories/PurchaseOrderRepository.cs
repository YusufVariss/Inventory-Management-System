using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class PurchaseOrderRepository : IPurchaseOrderRepository
    {
        private readonly GoStockDbContext _context;

        public PurchaseOrderRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PurchaseOrder>> GetAllPurchaseOrdersAsync()
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<PurchaseOrder?> GetPurchaseOrderByIdAsync(int id)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .FirstOrDefaultAsync(po => po.Id == id);
        }

        public async Task<PurchaseOrder?> GetPurchaseOrderByOrderNumberAsync(string orderNumber)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .FirstOrDefaultAsync(po => po.OrderNumber == orderNumber);
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersBySupplierAsync(int supplierId)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.SupplierId == supplierId)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByStatusAsync(string status)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.Status == status)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.OrderDate >= startDate && po.OrderDate <= endDate)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByUserAsync(int userId)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.UserId == userId)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<PurchaseOrder> CreatePurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            purchaseOrder.OrderDate = DateTime.Now;
            
            _context.PurchaseOrders.Add(purchaseOrder);
            await _context.SaveChangesAsync();
            
            return purchaseOrder;
        }

        public async Task<PurchaseOrder> UpdatePurchaseOrderAsync(PurchaseOrder purchaseOrder)
        {
            _context.PurchaseOrders.Update(purchaseOrder);
            await _context.SaveChangesAsync();
            
            return purchaseOrder;
        }

        public async Task<bool> DeletePurchaseOrderAsync(int id)
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
                return false;

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> PurchaseOrderExistsAsync(int id)
        {
            return await _context.PurchaseOrders.AnyAsync(po => po.Id == id);
        }

        public async Task<bool> OrderNumberExistsAsync(string orderNumber)
        {
            return await _context.PurchaseOrders.AnyAsync(po => po.OrderNumber == orderNumber);
        }

        public async Task<int> GetTotalPurchaseOrdersCountAsync()
        {
            return await _context.PurchaseOrders.CountAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersWithPaginationAsync(int page, int pageSize)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .OrderByDescending(po => po.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalPurchaseOrdersAmountAsync()
        {
            return await _context.PurchaseOrders
                .Where(po => po.Status == "delivered")
                .SumAsync(po => po.TotalAmount);
        }

        public async Task<decimal> GetPurchaseOrdersAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.PurchaseOrders
                .Where(po => po.Status == "delivered" && po.OrderDate >= startDate && po.OrderDate <= endDate)
                .SumAsync(po => po.TotalAmount);
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPendingPurchaseOrdersAsync()
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.Status == "pending" || po.Status == "approved")
                .OrderBy(po => po.ExpectedDeliveryDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetOverduePurchaseOrdersAsync()
        {
            var today = DateTime.Today;
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.ExpectedDeliveryDate < today && (po.Status == "pending" || po.Status == "approved"))
                .OrderBy(po => po.ExpectedDeliveryDate)
                .ToListAsync();
        }

        public async Task<int> GetPurchaseOrdersCountByStatusAsync(string status)
        {
            return await _context.PurchaseOrders
                .CountAsync(po => po.Status == status);
        }

        public async Task<decimal> GetAveragePurchaseOrderAmountAsync()
        {
            var deliveredOrders = await _context.PurchaseOrders
                .Where(po => po.Status == "delivered")
                .ToListAsync();

            if (!deliveredOrders.Any())
                return 0;

            return deliveredOrders.Average(po => po.TotalAmount);
        }

        public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByOrderNumberAsync(string orderNumber)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.User)
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.OrderNumber.Contains(orderNumber))
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetTopSuppliersByOrdersAsync(int count)
        {
            return await _context.PurchaseOrders
                .GroupBy(po => po.SupplierId)
                .Select(g => new { SupplierId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(count)
                .Join(_context.PurchaseOrders, x => x.SupplierId, po => po.SupplierId, (x, po) => po)
                .Include(po => po.Supplier)
                .ToListAsync();
        }

        public async Task<int> GetTotalItemsOrderedAsync()
        {
            return await _context.PurchaseOrderItems
                .SumAsync(poi => poi.Quantity);
        }
    }
}
