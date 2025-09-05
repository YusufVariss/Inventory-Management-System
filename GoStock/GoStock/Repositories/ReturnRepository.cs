using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class ReturnRepository : IReturnRepository
    {
        private readonly GoStockDbContext _context;
        private readonly ILogger<ReturnRepository> _logger;

        public ReturnRepository(GoStockDbContext context, ILogger<ReturnRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Return>> GetAllReturnsAsync()
        {
            return await _context.Returns
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<Return?> GetReturnByIdAsync(int id)
        {
            return await _context.Returns
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Return>> GetReturnsByProductAsync(string productName)
        {
            return await _context.Returns
                .Where(r => r.ProductName == productName)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Return>> GetReturnsByUserAsync(string userFullName)
        {
            return await _context.Returns
                .Where(r => r.UserFullName == userFullName)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Return>> GetReturnsByTypeAsync(string returnType)
        {
            return await _context.Returns
                .Where(r => r.ReturnType == returnType)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Return>> GetReturnsByStatusAsync(string status)
        {
            return await _context.Returns
                .Where(r => r.Status == status)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Return>> GetReturnsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Returns
                .Where(r => r.ReturnDate >= startDate && r.ReturnDate <= endDate)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<Return> CreateReturnAsync(Return returnItem)
        {
            returnItem.ReturnDate = DateTime.Now;
            
            _context.Returns.Add(returnItem);
            await _context.SaveChangesAsync();
            
            return returnItem;
        }

        public async Task<Return> UpdateReturnAsync(Return returnItem)
        {
            _context.Returns.Update(returnItem);
            await _context.SaveChangesAsync();
            
            return returnItem;
        }

        public async Task<bool> DeleteReturnAsync(int id)
        {
            var returnItem = await _context.Returns.FindAsync(id);
            if (returnItem == null)
                return false;

            _context.Returns.Remove(returnItem);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> ReturnExistsAsync(int id)
        {
            return await _context.Returns.AnyAsync(r => r.Id == id);
        }

        public async Task<int> GetTotalReturnsCountAsync()
        {
            return await _context.Returns.CountAsync();
        }

        public async Task<IEnumerable<Return>> GetReturnsWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Returns
                .OrderByDescending(r => r.ReturnDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalReturnsAmountAsync()
        {
            var allReturns = await _context.Returns.ToListAsync();
            decimal totalAmount = 0;

            foreach (var returnItem in allReturns)
            {
                if (returnItem.Amount.HasValue)
                {
                    // Amount alanı varsa onu kullan
                    totalAmount += returnItem.Amount.Value;
                }
                else
                {
                    // Amount alanı yoksa 0 olarak ayarla
                    // Bu durumda fiyat bilgisi olmadığı için 0 kabul ediyoruz
                }
            }

            return totalAmount;
        }

        public async Task<decimal> GetReturnsAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var result = await _context.Returns
                .Where(r => r.Amount.HasValue && r.ReturnDate >= startDate && r.ReturnDate <= endDate)
                .SumAsync(r => r.Amount);
            return result ?? 0;
        }

        public async Task<IEnumerable<Return>> GetReturnsByReasonAsync(string reason)
        {
            return await _context.Returns
                .Where(r => r.Reason.Contains(reason))
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<int> GetReturnsCountByStatusAsync(string status)
        {
            return await _context.Returns
                .CountAsync(r => r.Status == status);
        }

        public async Task<decimal> GetAverageReturnAmountAsync()
        {
            var returnsWithAmount = await _context.Returns
                .Where(r => r.Amount.HasValue)
                .ToListAsync();

            if (!returnsWithAmount.Any())
                return 0;

            return returnsWithAmount.Average(r => r.Amount ?? 0);
        }

        public async Task<IEnumerable<Return>> GetReturnsBySaleAsync(int saleId)
        {
            // SaleId ile iade arama kaldırıldı - ProductName kullanıyoruz
            return await _context.Returns
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Return>> GetTopReturnedProductsAsync(int count)
        {
            // En çok iade edilen ürünleri miktara göre sırala
            return await _context.Returns
                .GroupBy(r => r.ProductName)
                .Select(g => new { 
                    ProductName = g.Key, 
                    TotalQuantity = g.Sum(r => r.Quantity) // Toplam miktar
                })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(count)
                .Join(_context.Returns, x => x.ProductName, r => r.ProductName, (x, r) => r)
                .ToListAsync();
        }

        public async Task<IEnumerable<Return>> GetRecentReturnsAsync(int count)
        {
            return await _context.Returns
                .OrderByDescending(r => r.ReturnDate)
                .Take(count)
                .ToListAsync();
        }

        public async Task<int> GetTotalItemsReturnedAsync()
        {
            return await _context.Returns
                .SumAsync(r => r.Quantity);
        }

        public async Task<Dictionary<string, int>> GetReturnsStatusDistributionAsync()
        {
            return await _context.Returns
                .Where(r => !string.IsNullOrEmpty(r.Status))
                .GroupBy(r => r.Status)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }

        public async Task<Dictionary<string, int>> GetReturnsByReasonDistributionAsync()
        {
            return await _context.Returns
                .Where(r => !string.IsNullOrEmpty(r.Reason))
                .GroupBy(r => r.Reason)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }
    }
}
