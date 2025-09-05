using GoStock.Models;

namespace GoStock.Services
{
    public interface ISaleService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<Sale>> GetAllSalesAsync();
        Task<Sale?> GetSaleByIdAsync(int id);
        Task<Sale> CreateSaleAsync(Sale sale);
        Task<Sale> UpdateSaleAsync(Sale sale);
        Task<bool> DeleteSaleAsync(int id);
        
        // Satış yönetimi
        Task<IEnumerable<Sale>> GetSalesByProductAsync(int productId);
        Task<IEnumerable<Sale>> GetSalesByUserAsync(int userId);
        Task<IEnumerable<Sale>> GetSalesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Sale>> GetSalesByStatusAsync(string status);
        Task<IEnumerable<Sale>> GetSalesByPaymentMethodAsync(string paymentMethod);
        
        // Satış kontrolü
        Task<bool> SaleExistsAsync(int id);
        Task<int> GetTotalSalesCountAsync();
        Task<decimal> GetTotalSalesAmountAsync();
        Task<decimal> GetSalesAmountByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        // Arama ve filtreleme
        Task<IEnumerable<Sale>> GetSalesWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<Sale>> GetTopSellingProductsAsync(int count);
        
        // İş mantığı
        Task<Sale> ProcessSaleAsync(Sale sale);
        Task<bool> ValidateSaleAsync(Sale sale);
        Task<bool> CanProcessSaleAsync(int productId, int quantity);
        Task<bool> UpdateSaleStatusAsync(int saleId, string status);
        
        // İstatistikler
        Task<decimal> GetAverageSaleAmountAsync();
        Task<int> GetTotalItemsSoldAsync();
        Task<Dictionary<string, int>> GetSalesStatusDistributionAsync();
        Task<Dictionary<string, decimal>> GetSalesByPaymentMethodDistributionAsync();
        Task<IEnumerable<Sale>> GetRecentSalesAsync(int count);
    }
}
