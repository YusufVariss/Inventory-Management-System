using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly GoStockDbContext _context;

        public CategoryRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoryDtosAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    CreatedAt = c.CreatedAt,
                    // UpdatedAt = c.UpdatedAt, // Geçici olarak kaldırıldı
                    ProductCount = c.Products.Count
                })
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<CategoryDto?> GetCategoryDtoByIdAsync(int id)
        {
            return await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    CreatedAt = c.CreatedAt,
                    // UpdatedAt = c.UpdatedAt, // Geçici olarak kaldırıldı
                    ProductCount = c.Products.Count
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CategoryDetailDto?> GetCategoryDetailDtoByIdAsync(int id)
        {
            return await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryDetailDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    CreatedAt = c.CreatedAt,
                    // UpdatedAt = c.UpdatedAt, // Geçici olarak kaldırıldı
                    Products = c.Products.Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        CategoryId = p.CategoryId,
                        CategoryName = c.Name,
                        Price = p.Price,
                        StockQuantity = p.StockQuantity,
                        IsActive = p.IsActive,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<Category?> GetCategoryByNameAsync(string name)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == name);
        }

        public async Task<IEnumerable<Category>> GetActiveCategoriesAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryDto>> GetActiveCategoryDtosAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    CreatedAt = c.CreatedAt,
                    // UpdatedAt = c.UpdatedAt, // Geçici olarak kaldırıldı
                    ProductCount = c.Products.Count
                })
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category> CreateCategoryAsync(Category category)
        {
            category.CreatedAt = DateTime.Now;
            
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            
            return category;
        }

        public async Task<Category> UpdateCategoryAsync(Category category)
        {
            var existingCategory = await _context.Categories.FindAsync(category.Id);
            if (existingCategory != null)
            {
                existingCategory.Name = category.Name;
                existingCategory.Description = category.Description;
                existingCategory.Color = category.Color;
                // existingCategory.UpdatedAt = DateTime.Now; // Geçici olarak kaldırıldı
                
                _context.Categories.Update(existingCategory);
                await _context.SaveChangesAsync();
                
                return existingCategory;
            }
            
            return category;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return false;

            // Kategoriye bağlı ürün var mı kontrol et
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
                return false; // Ürünler varsa silme

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> CategoryExistsAsync(int id)
        {
            return await _context.Categories.AnyAsync(c => c.Id == id);
        }

        public async Task<bool> CategoryNameExistsAsync(string name)
        {
            return await _context.Categories.AnyAsync(c => c.Name == name);
        }

        public async Task<int> GetTotalCategoriesCountAsync()
        {
            return await _context.Categories.CountAsync();
        }

        public async Task<IEnumerable<Category>> GetCategoriesWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Categories
                .OrderBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoryDtosWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    CreatedAt = c.CreatedAt,
                    // UpdatedAt = c.UpdatedAt, // Geçici olarak kaldırıldı
                    ProductCount = c.Products.Count
                })
                .OrderBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetCategoryProductCountAsync(int categoryId)
        {
            return await _context.Products.CountAsync(p => p.CategoryId == categoryId);
        }

        public async Task<decimal> GetCategoryTotalValueAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .SumAsync(p => p.StockQuantity * p.Price);
        }
    }
}
