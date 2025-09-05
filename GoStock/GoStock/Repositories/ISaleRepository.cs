using GoStock.Models;

namespace GoStock.Repositories
{
    public interface ISaleRepository
    {
        Task<IEnumerable<Sale>> GetAllSalesAsync();
        Task<Sale?> GetSaleByIdAsync(int id);
        Task<IEnumerable<Sale>> GetSalesByProductAsync(int productId);
        Task<IEnumerable<Sale>> GetSalesByUserAsync(int userId);
        Task<IEnumerable<Sale>> GetSalesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Sale>> GetSalesByStatusAsync(string status);
        Task<IEnumerable<Sale>> GetSalesByPaymentMethodAsync(string paymentMethod);
        Task<Sale> CreateSaleAsync(Sale sale);
        Task<Sale> UpdateSaleAsync(Sale sale);
        Task<bool> DeleteSaleAsync(int id);
        Task<bool> SaleExistsAsync(int id);
        Task<int> GetTotalSalesCountAsync();
        Task<IEnumerable<Sale>> GetSalesWithPaginationAsync(int page, int pageSize);
        Task<decimal> GetTotalSalesAmountAsync();
        Task<decimal> GetSalesAmountByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Sale>> GetTopSellingProductsAsync(int count);
        Task<decimal> GetAverageSaleAmountAsync();
        Task<int> GetTotalItemsSoldAsync();
    }
}
