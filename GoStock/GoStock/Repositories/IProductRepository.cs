using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<IEnumerable<ProductDto>> GetAllDtosAsync();
        Task<Product?> GetByIdAsync(int id);
        Task<ProductDto?> GetDtoByIdAsync(int id);
        Task<Product> CreateAsync(Product product);
        Task<Product> UpdateAsync(Product product);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<ProductDto>> GetDtosByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> GetLowStockAsync();
        Task<IEnumerable<Product>> GetLowStockProductsAsync();
        Task<IEnumerable<ProductDto>> GetLowStockDtosAsync();
        Task<IEnumerable<Product>> SearchAsync(string searchTerm);
        Task<IEnumerable<ProductDto>> SearchDtosAsync(string searchTerm);
        Task<int> GetTotalCountAsync();
        Task<IEnumerable<Product>> GetWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<ProductDto>> GetDtosWithPaginationAsync(int page, int pageSize);
    }
}
