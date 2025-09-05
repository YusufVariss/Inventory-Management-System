using GoStock.Models;

namespace GoStock.Services
{
    public interface IReturnService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<Return>> GetAllReturnsAsync();
        Task<Return?> GetReturnByIdAsync(int id);
        Task<Return> CreateReturnAsync(Return returnItem);
        Task<Return> UpdateReturnAsync(Return returnItem);
        Task<bool> DeleteReturnAsync(int id);
        
        // İade yönetimi
        Task<IEnumerable<Return>> GetReturnsByProductAsync(int productId);
        Task<IEnumerable<Return>> GetReturnsByUserAsync(string userFullName);
        Task<IEnumerable<Return>> GetReturnsBySaleAsync(int productId);
        Task<IEnumerable<Return>> GetReturnsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Return>> GetReturnsByStatusAsync(string status);
        Task<IEnumerable<Return>> GetReturnsByReasonAsync(string reason);
        
        // İade kontrolü
        Task<bool> ReturnExistsAsync(int id);
        Task<int> GetTotalReturnsCountAsync();
        Task<decimal> GetTotalReturnsAmountAsync();
        Task<decimal> GetReturnsAmountByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        // Arama ve filtreleme
        Task<IEnumerable<Return>> GetReturnsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<Return>> GetTopReturnedProductsAsync(int count);
        
        // İş mantığı
        Task<Return> ProcessReturnAsync(Return returnItem);
        Task<bool> ValidateReturnAsync(Return returnItem);
        Task<bool> CanProcessReturnAsync(int productId, int quantity);
        Task<bool> UpdateReturnStatusAsync(int returnId, string status);
        Task<bool> ApproveReturnAsync(int returnId);
        Task<bool> RejectReturnAsync(int returnId);
        
        // İstatistikler
        Task<decimal> GetAverageReturnAmountAsync();
        Task<int> GetTotalItemsReturnedAsync();
        Task<Dictionary<string, int>> GetReturnsStatusDistributionAsync();
        Task<Dictionary<string, int>> GetReturnsByReasonDistributionAsync();
        Task<IEnumerable<Return>> GetRecentReturnsAsync(int count);
    }
}
