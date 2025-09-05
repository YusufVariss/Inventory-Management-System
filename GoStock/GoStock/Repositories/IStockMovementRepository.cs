using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IStockMovementRepository
    {
        Task<IEnumerable<StockMovement>> GetAllStockMovementsAsync();
        Task<IEnumerable<StockMovement>> GetAllStockMovementsWithoutNavigationAsync();
        Task<StockMovement?> GetStockMovementByIdAsync(int id);
        Task<IEnumerable<StockMovement>> GetStockMovementsByProductAsync(int productId);
        Task<IEnumerable<StockMovement>> GetStockMovementsByTypeAsync(string movementType);
        Task<IEnumerable<StockMovement>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<StockMovement>> GetStockMovementsByUserAsync(int userId);
        Task<StockMovement> CreateStockMovementAsync(StockMovement stockMovement);
        Task<StockMovement> UpdateStockMovementAsync(StockMovement stockMovement);
        Task<bool> DeleteStockMovementAsync(int id);
        Task<bool> StockMovementExistsAsync(int id);
        Task<int> GetTotalStockMovementsCountAsync();
        Task<IEnumerable<StockMovement>> GetStockMovementsWithPaginationAsync(int page, int pageSize);
        Task<decimal> GetProductTotalStockValueAsync(int productId);
        Task<int> GetProductTotalStockInAsync(int productId);
        Task<int> GetProductTotalStockOutAsync(int productId);
        Task<IEnumerable<StockMovement>> GetLowStockAlertsAsync();
    }
}
