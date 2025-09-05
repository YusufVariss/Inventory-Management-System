using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Services
{
    public interface ICategoryService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<IEnumerable<CategoryDto>> GetAllCategoryDtosAsync();
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<CategoryDto?> GetCategoryDtoByIdAsync(int id);
        Task<CategoryDetailDto?> GetCategoryDetailDtoByIdAsync(int id);
        Task<Category?> GetCategoryByNameAsync(string name);
        Task<Category> CreateCategoryAsync(Category category, string currentUserId);
        Task<Category> UpdateCategoryAsync(Category category);
        Task<bool> DeleteCategoryAsync(int id);
        
        // Kategori yönetimi
        Task<IEnumerable<Category>> GetActiveCategoriesAsync();
        Task<IEnumerable<CategoryDto>> GetActiveCategoryDtosAsync();
        Task<bool> ActivateCategoryAsync(int id);
        Task<bool> DeactivateCategoryAsync(int id);
        Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null);
        
        // Ürün yönetimi
        Task<IEnumerable<Product>> GetCategoryProductsAsync(int categoryId);
        Task<int> GetCategoryProductCountAsync(int categoryId);
        Task<bool> HasProductsAsync(int categoryId);
        Task<decimal> GetCategoryTotalValueAsync(int categoryId);
        
        // Arama ve filtreleme
        Task<IEnumerable<Category>> SearchCategoriesAsync(string searchTerm);
        Task<IEnumerable<Category>> GetCategoriesWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<CategoryDto>> GetCategoryDtosWithPaginationAsync(int page, int pageSize);
        Task<int> GetTotalCategoriesCountAsync();
        
        // İstatistikler
        Task<Dictionary<string, int>> GetCategoryProductDistributionAsync();
        Task<Dictionary<string, decimal>> GetCategoryValueDistributionAsync();
        Task<IEnumerable<Category>> GetTopCategoriesByProductCountAsync(int count);
        Task<IEnumerable<CategoryStatsDto>> GetCategoriesWithStatsAsync();
    }
}
