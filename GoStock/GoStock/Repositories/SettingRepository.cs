using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class SettingRepository : ISettingRepository
    {
        private readonly GoStockDbContext _context;

        public SettingRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Setting>> GetAllSettingsAsync()
        {
            return await _context.Settings
                .OrderBy(s => s.Category)
                .ThenBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<Setting?> GetSettingByIdAsync(int id)
        {
            return await _context.Settings
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Setting?> GetSettingByKeyAsync(string key)
        {
            return await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
        }

        public async Task<string?> GetSettingValueAsync(string key)
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
            
            return setting?.Value;
        }

        public async Task<Setting> CreateSettingAsync(Setting setting)
        {
            setting.CreatedAt = DateTime.Now;
            setting.UpdatedAt = DateTime.Now;
            
            _context.Settings.Add(setting);
            await _context.SaveChangesAsync();
            
            return setting;
        }

        public async Task<Setting> UpdateSettingAsync(Setting setting)
        {
            setting.UpdatedAt = DateTime.Now;
            
            _context.Settings.Update(setting);
            await _context.SaveChangesAsync();
            
            return setting;
        }

        public async Task<bool> DeleteSettingAsync(int id)
        {
            var setting = await _context.Settings.FindAsync(id);
            if (setting == null)
                return false;

            _context.Settings.Remove(setting);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> SettingExistsAsync(int id)
        {
            return await _context.Settings.AnyAsync(s => s.Id == id);
        }

        public async Task<bool> SettingKeyExistsAsync(string key)
        {
            return await _context.Settings.AnyAsync(s => s.Key == key);
        }

        public async Task<int> GetTotalSettingsCountAsync()
        {
            return await _context.Settings.CountAsync();
        }

        public async Task<IEnumerable<Setting>> GetSettingsWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Settings
                .OrderBy(s => s.Category)
                .ThenBy(s => s.Key)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<Setting>> GetSettingsByCategoryAsync(string category)
        {
            return await _context.Settings
                .Where(s => s.Category == category)
                .OrderBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<bool> UpdateSettingValueAsync(string key, string value)
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
            
            if (setting == null)
                return false;

            setting.Value = value;
            setting.UpdatedAt = DateTime.Now;
            
            _context.Settings.Update(setting);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<Dictionary<string, string>> GetSettingsAsDictionaryAsync()
        {
            var settings = await _context.Settings
                .Where(s => s.IsActive)
                .ToListAsync();
            
            return settings.ToDictionary(s => s.Key, s => s.Value ?? string.Empty);
        }

        public async Task<IEnumerable<Setting>> GetActiveSettingsAsync()
        {
            return await _context.Settings
                .Where(s => s.IsActive)
                .OrderBy(s => s.Category)
                .ThenBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<bool> BulkUpdateSettingsAsync(Dictionary<string, string> settings)
        {
            try
            {
                foreach (var kvp in settings)
                {
                    var setting = await _context.Settings
                        .FirstOrDefaultAsync(s => s.Key == kvp.Key);
                    
                    if (setting != null)
                    {
                        setting.Value = kvp.Value;
                        setting.UpdatedAt = DateTime.Now;
                        _context.Settings.Update(setting);
                    }
                }
                
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<Setting>> GetSettingsByGroupAsync(string group)
        {
            return await _context.Settings
                .Where(s => s.Group == group)
                .OrderBy(s => s.Category)
                .ThenBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<int> GetSettingsCountByCategoryAsync(string category)
        {
            return await _context.Settings
                .CountAsync(s => s.Category == category);
        }

        public async Task<IEnumerable<Setting>> GetSettingsByCategoryAndGroupAsync(string category, string group)
        {
            return await _context.Settings
                .Where(s => s.Category == category && s.Group == group)
                .OrderBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<bool> ActivateSettingAsync(string key)
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
            
            if (setting == null)
                return false;

            setting.IsActive = true;
            setting.UpdatedAt = DateTime.Now;
            
            _context.Settings.Update(setting);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> DeactivateSettingAsync(string key)
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
            
            if (setting == null)
                return false;

            setting.IsActive = false;
            setting.UpdatedAt = DateTime.Now;
            
            _context.Settings.Update(setting);
            await _context.SaveChangesAsync();
            
            return true;
        }
    }
}
