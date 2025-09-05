using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class SaleRepository : ISaleRepository
    {
        private readonly GoStockDbContext _context;

        public SaleRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Sale>> GetAllSalesAsync()
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        public async Task<Sale?> GetSaleByIdAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Sale>> GetSalesByProductAsync(int productId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .Where(s => s.ProductId == productId)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetSalesByUserAsync(int userId)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetSalesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .Where(s => s.SaleDate >= startDate && s.SaleDate <= endDate)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetSalesByStatusAsync(string status)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .Where(s => s.Status == status)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sale>> GetSalesByPaymentMethodAsync(string paymentMethod)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .Where(s => s.PaymentMethod == paymentMethod)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }

        public async Task<Sale> CreateSaleAsync(Sale sale)
        {
            sale.SaleDate = DateTime.Now;
            
            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            
            return sale;
        }

        public async Task<Sale> UpdateSaleAsync(Sale sale)
        {
            _context.Sales.Update(sale);
            await _context.SaveChangesAsync();
            
            return sale;
        }

        public async Task<bool> DeleteSaleAsync(int id)
        {
            var sale = await _context.Sales.FindAsync(id);
            if (sale == null)
                return false;

            _context.Sales.Remove(sale);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> SaleExistsAsync(int id)
        {
            return await _context.Sales.AnyAsync(s => s.Id == id);
        }

        public async Task<int> GetTotalSalesCountAsync()
        {
            return await _context.Sales.CountAsync();
        }

        public async Task<IEnumerable<Sale>> GetSalesWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.User)
                .OrderByDescending(s => s.SaleDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalSalesAmountAsync()
        {
            return await _context.Sales
                .Where(s => s.Status == "completed")
                .SumAsync(s => s.TotalAmount);
        }

        public async Task<decimal> GetSalesAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Sales
                .Where(s => s.Status == "completed" && s.SaleDate >= startDate && s.SaleDate <= endDate)
                .SumAsync(s => s.TotalAmount);
        }

        public async Task<IEnumerable<Sale>> GetTopSellingProductsAsync(int count)
        {
            return await _context.Sales
                .Include(s => s.Product)
                .Where(s => s.Status == "completed")
                .GroupBy(s => s.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    TotalQuantity = g.Sum(s => s.Quantity),
                    TotalAmount = g.Sum(s => s.TotalAmount),
                    LastSale = g.OrderByDescending(s => s.SaleDate).First()
                })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(count)
                .Select(x => x.LastSale)
                .ToListAsync();
        }

        public async Task<decimal> GetAverageSaleAmountAsync()
        {
            var completedSales = await _context.Sales
                .Where(s => s.Status == "completed")
                .ToListAsync();

            if (!completedSales.Any())
                return 0;

            return completedSales.Average(s => s.TotalAmount);
        }

        public async Task<int> GetTotalItemsSoldAsync()
        {
            return await _context.Sales
                .Where(s => s.Status == "completed")
                .SumAsync(s => s.Quantity);
        }
    }
}
