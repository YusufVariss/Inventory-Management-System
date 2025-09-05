using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<IEnumerable<ProductDto>> GetAllProductDtosAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<ProductDto?> GetProductDtoByIdAsync(int id);
        Task<Product> CreateProductAsync(Product product, string currentUserId);
        Task<Product> UpdateProductAsync(int id, Product product);
        Task<bool> DeleteProductAsync(int id);
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId);
        Task<IEnumerable<ProductDto>> GetProductDtosByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> GetLowStockProductsAsync();
        Task<IEnumerable<ProductDto>> GetLowStockProductDtosAsync();
        Task<IEnumerable<Product>> SearchProductsAsync(string searchTerm);
        Task<IEnumerable<ProductDto>> SearchProductDtosAsync(string searchTerm);
        Task<IEnumerable<Product>> GetActiveProductsAsync();
        Task<int> GetTotalStockAsync();
        Task<decimal> GetTotalValueAsync();
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<Product>> GetProductsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<ProductDto>> GetProductDtosWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<CriticalStockDto>> GetCriticalStockProductsAsync();
    }
}
