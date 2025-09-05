using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class StockMovementRepository : IStockMovementRepository
    {
        private readonly GoStockDbContext _context;

        public StockMovementRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StockMovement>> GetAllStockMovementsAsync()
        {
            try
            {
                // Include ile navigation property'leri yükle
                var movements = await _context.StockMovements
                    .Include(sm => sm.Product)
                    .Include(sm => sm.User)
                    .OrderByDescending(sm => sm.MovementDate)
                    .ToListAsync();
                
                Console.WriteLine($"🔍 Navigation property'ler ile {movements.Count} stok hareketi bulundu");
                return movements;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🔍 Hata: {ex.Message}");
                
                // Hata durumunda sadece temel veriyi döndür
                return await _context.StockMovements
                    .OrderByDescending(sm => sm.MovementDate)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<StockMovement>> GetAllStockMovementsWithoutNavigationAsync()
        {
            return await _context.StockMovements
                .OrderByDescending(sm => sm.MovementDate)
                .ToListAsync();
        }

        public async Task<StockMovement?> GetStockMovementByIdAsync(int id)
        {
            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .FirstOrDefaultAsync(sm => sm.Id == id);
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByProductAsync(int productId)
        {
            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .Where(sm => sm.ProductId.HasValue && sm.ProductId.Value == productId)
                .OrderByDescending(sm => sm.MovementDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByTypeAsync(string movementType)
        {
            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .Where(sm => sm.MovementType == movementType)
                .OrderByDescending(sm => sm.MovementDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .Where(sm => sm.MovementDate >= startDate && sm.MovementDate <= endDate)
                .OrderByDescending(sm => sm.MovementDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByUserAsync(int userId)
        {
            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .Where(sm => sm.UserId.HasValue && sm.UserId.Value == userId)
                .OrderByDescending(sm => sm.MovementDate)
                .ToListAsync();
        }

        public async Task<StockMovement> CreateStockMovementAsync(StockMovement stockMovement)
        {
            stockMovement.MovementDate = DateTime.Now;
            
            _context.StockMovements.Add(stockMovement);
            await _context.SaveChangesAsync();
            
            return stockMovement;
        }

        public async Task<StockMovement> UpdateStockMovementAsync(StockMovement stockMovement)
        {
            _context.StockMovements.Update(stockMovement);
            await _context.SaveChangesAsync();
            
            return stockMovement;
        }

        public async Task<bool> DeleteStockMovementAsync(int id)
        {
            var stockMovement = await _context.StockMovements.FindAsync(id);
            if (stockMovement == null)
                return false;

            _context.StockMovements.Remove(stockMovement);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> StockMovementExistsAsync(int id)
        {
            return await _context.StockMovements.AnyAsync(sm => sm.Id == id);
        }

        public async Task<int> GetTotalStockMovementsCountAsync()
        {
            return await _context.StockMovements.CountAsync();
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsWithPaginationAsync(int page, int pageSize)
        {
            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .OrderByDescending(sm => sm.MovementDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<decimal> GetProductTotalStockValueAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return 0;

            return product.StockQuantity * product.Price;
        }

        public async Task<decimal> GetTotalValueAsync()
        {
            var products = await _context.Products
                .ToListAsync();

            return products.Sum(p => p.StockQuantity * p.Price);
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Where(p => p.StockQuantity <= 10)
                .OrderBy(p => p.StockQuantity)
                .ToListAsync();
        }

        public async Task<IEnumerable<int>> GetLowStockProductIdsAsync()
        {
            var lowStockProducts = await _context.Products
                .Where(p => p.StockQuantity <= 10)
                .Select(p => p.Id)
                .ToListAsync();

            return lowStockProducts;
        }

        public async Task<int> GetProductTotalStockInAsync(int productId)
        {
            return await _context.StockMovements
                .Where(sm => sm.ProductId.HasValue && sm.ProductId.Value == productId && sm.MovementType == "in")
                .SumAsync(sm => sm.Quantity);
        }

        public async Task<int> GetProductTotalStockOutAsync(int productId)
        {
            return await _context.StockMovements
                .Where(sm => sm.ProductId.HasValue && sm.ProductId.Value == productId && sm.MovementType == "out")
                .SumAsync(sm => sm.Quantity);
        }

        public async Task<IEnumerable<StockMovement>> GetLowStockAlertsAsync()
        {
            var lowStockProducts = await _context.Products
                .Where(p => p.StockQuantity <= 10)
                .Select(p => p.Id)
                .ToListAsync();

            return await _context.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .Where(sm => sm.ProductId.HasValue && lowStockProducts.Contains(sm.ProductId.Value))
                .OrderByDescending(sm => sm.MovementDate)
                .Take(50) // Son 50 hareket
                .ToListAsync();
        }
    }
}
