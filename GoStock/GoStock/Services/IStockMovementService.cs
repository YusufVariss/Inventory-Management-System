using GoStock.Models;

namespace GoStock.Services
{
    public interface IStockMovementService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<StockMovement>> GetAllStockMovementsAsync();
        Task<IEnumerable<StockMovement>> GetAllStockMovementsWithoutNavigationAsync();
        Task<StockMovement?> GetStockMovementByIdAsync(int id);
        Task<StockMovement> CreateStockMovementAsync(StockMovement stockMovement);
        Task<StockMovement> UpdateStockMovementAsync(StockMovement stockMovement);
        Task<bool> DeleteStockMovementAsync(int id);
        
        // Stok hareket yönetimi
        Task<IEnumerable<StockMovement>> GetStockMovementsByProductAsync(int productId);
        Task<IEnumerable<StockMovement>> GetStockMovementsByTypeAsync(string movementType);
        Task<IEnumerable<StockMovement>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<StockMovement>> GetStockMovementsByUserAsync(int userId);
        
        // Stok kontrolü
        Task<bool> StockMovementExistsAsync(int id);
        Task<int> GetTotalStockMovementsCountAsync();
        Task<decimal> GetProductTotalStockValueAsync(int productId);
        Task<int> GetProductTotalStockInAsync(int productId);
        Task<int> GetProductTotalStockOutAsync(int productId);
        
        // Arama ve filtreleme
        Task<IEnumerable<StockMovement>> GetStockMovementsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<StockMovement>> GetLowStockAlertsAsync();
        
        // İş mantığı
        Task<StockMovement> ProcessStockInAsync(int? productId, int quantity, int? userId, decimal? unitPrice = null, decimal? totalAmount = null, string? reference = null, string? notes = null);
        Task<StockMovement> ProcessStockOutAsync(int? productId, int quantity, int? userId, decimal? unitPrice = null, decimal? totalAmount = null, string? reference = null, string? notes = null);
        Task<bool> ValidateStockMovementAsync(StockMovement stockMovement);
        Task<bool> CanProcessStockOutAsync(int? productId, int quantity);
        
        // İstatistikler
        Task<Dictionary<string, int>> GetStockMovementTypeDistributionAsync();
        Task<Dictionary<string, int>> GetStockMovementByProductDistributionAsync();
        Task<decimal> GetTotalStockValueAsync();
        Task<IEnumerable<StockMovement>> GetRecentStockMovementsAsync(int count);
    }
}
