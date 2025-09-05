using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class SupplierRepository : ISupplierRepository
    {
        private readonly GoStockDbContext _context;

        public SupplierRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Supplier>> GetAllSuppliersAsync()
        {
            return await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Supplier?> GetSupplierByIdAsync(int id)
        {
            return await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Supplier?> GetSupplierByNameAsync(string name)
        {
            return await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .FirstOrDefaultAsync(s => s.Name == name);
        }

        public async Task<IEnumerable<Supplier>> GetActiveSuppliersAsync()
        {
            return await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Supplier> CreateSupplierAsync(Supplier supplier)
        {
            supplier.CreatedAt = DateTime.Now;
            
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();
            
            return supplier;
        }

        public async Task<Supplier> UpdateSupplierAsync(Supplier supplier)
        {
            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();
            
            return supplier;
        }

        public async Task<bool> DeleteSupplierAsync(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
                return false;

            // Tedarikçiye bağlı sipariş var mı kontrol et
            var hasPurchaseOrders = await _context.PurchaseOrders.AnyAsync(po => po.SupplierId == id);
            if (hasPurchaseOrders)
                return false; // Siparişler varsa silme

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> SupplierExistsAsync(int id)
        {
            return await _context.Suppliers.AnyAsync(s => s.Id == id);
        }

        public async Task<bool> SupplierNameExistsAsync(string name)
        {
            return await _context.Suppliers.AnyAsync(s => s.Name == name);
        }

        public async Task<int> GetTotalSuppliersCountAsync()
        {
            return await _context.Suppliers.CountAsync();
        }

        public async Task<IEnumerable<Supplier>> GetSuppliersWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .OrderBy(s => s.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseOrder>> GetSupplierPurchaseOrdersAsync(int supplierId)
        {
            return await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderItems)
                .Where(po => po.SupplierId == supplierId)
                .OrderByDescending(po => po.OrderDate)
                .ToListAsync();
        }

        public async Task<int> GetSupplierPurchaseOrderCountAsync(int supplierId)
        {
            return await _context.PurchaseOrders
                .CountAsync(po => po.SupplierId == supplierId);
        }

        public async Task<decimal> GetSupplierTotalSpentAsync(int supplierId)
        {
            return await _context.PurchaseOrders
                .Where(po => po.SupplierId == supplierId && po.Status == "delivered")
                .SumAsync(po => po.TotalAmount);
        }

        public async Task<decimal> GetSupplierTotalSpentByDateRangeAsync(int supplierId, DateTime startDate, DateTime endDate)
        {
            return await _context.PurchaseOrders
                .Where(po => po.SupplierId == supplierId && po.Status == "delivered" && 
                             po.OrderDate >= startDate && po.OrderDate <= endDate)
                .SumAsync(po => po.TotalAmount);
        }

        public async Task<Supplier?> GetSupplierByEmailAsync(string email)
        {
            return await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .FirstOrDefaultAsync(s => s.Email == email);
        }

        public Task<IEnumerable<Product>> GetSupplierProductsAsync(int supplierId)
        {
            // Product model no longer has SupplierId, return empty list
            return Task.FromResult<IEnumerable<Product>>(new List<Product>());
        }

        public Task<int> GetSupplierProductCountAsync(int supplierId)
        {
            // Product model no longer has SupplierId, return 0
            return Task.FromResult(0);
        }

        public Task<decimal> GetSupplierTotalValueAsync(int supplierId)
        {
            // Product model no longer has SupplierId, return 0
            return Task.FromResult(0m);
        }
    }
}
