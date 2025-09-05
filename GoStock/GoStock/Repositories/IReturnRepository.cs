using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IReturnRepository
    {
        Task<IEnumerable<Return>> GetAllReturnsAsync();
        Task<Return?> GetReturnByIdAsync(int id);
        Task<IEnumerable<Return>> GetReturnsByProductAsync(string productName);
        Task<IEnumerable<Return>> GetReturnsByUserAsync(string userFullName);
        Task<IEnumerable<Return>> GetReturnsByTypeAsync(string returnType);
        Task<IEnumerable<Return>> GetReturnsByStatusAsync(string status);
        Task<IEnumerable<Return>> GetReturnsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<Return> CreateReturnAsync(Return returnItem);
        Task<Return> UpdateReturnAsync(Return returnItem);
        Task<bool> DeleteReturnAsync(int id);
        Task<bool> ReturnExistsAsync(int id);
        Task<int> GetTotalReturnsCountAsync();
        Task<IEnumerable<Return>> GetReturnsWithPaginationAsync(int page, int pageSize);
        Task<decimal> GetTotalReturnsAmountAsync();
        Task<decimal> GetReturnsAmountByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Return>> GetReturnsByReasonAsync(string reason);
        Task<int> GetReturnsCountByStatusAsync(string status);
        Task<decimal> GetAverageReturnAmountAsync();
        Task<IEnumerable<Return>> GetReturnsBySaleAsync(int productId);
        Task<IEnumerable<Return>> GetTopReturnedProductsAsync(int count);
        Task<IEnumerable<Return>> GetRecentReturnsAsync(int count);
        Task<int> GetTotalItemsReturnedAsync();
        Task<Dictionary<string, int>> GetReturnsStatusDistributionAsync();
        Task<Dictionary<string, int>> GetReturnsByReasonDistributionAsync();
    }
}
