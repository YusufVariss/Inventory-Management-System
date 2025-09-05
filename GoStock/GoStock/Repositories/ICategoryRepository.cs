using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<IEnumerable<CategoryDto>> GetAllCategoryDtosAsync();
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<CategoryDto?> GetCategoryDtoByIdAsync(int id);
        Task<CategoryDetailDto?> GetCategoryDetailDtoByIdAsync(int id);
        Task<Category?> GetCategoryByNameAsync(string name);
        Task<IEnumerable<Category>> GetActiveCategoriesAsync();
        Task<IEnumerable<CategoryDto>> GetActiveCategoryDtosAsync();
        Task<Category> CreateCategoryAsync(Category category);
        Task<Category> UpdateCategoryAsync(Category category);
        Task<bool> DeleteCategoryAsync(int id);
        Task<bool> CategoryExistsAsync(int id);
        Task<bool> CategoryNameExistsAsync(string name);
        Task<int> GetTotalCategoriesCountAsync();
        Task<IEnumerable<Category>> GetCategoriesWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<CategoryDto>> GetCategoryDtosWithPaginationAsync(int page, int pageSize);
        Task<int> GetCategoryProductCountAsync(int categoryId);
        Task<decimal> GetCategoryTotalValueAsync(int categoryId);
    }
}
