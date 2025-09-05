using GoStock.Models;

namespace GoStock.Services
{
    public interface ISettingService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<Setting>> GetAllSettingsAsync();
        Task<Setting?> GetSettingByIdAsync(int id);
        Task<Setting> CreateSettingAsync(Setting setting);
        Task<Setting> UpdateSettingAsync(Setting setting);
        Task<bool> DeleteSettingAsync(int id);
        
        // Ayar yönetimi
        Task<Setting?> GetSettingByKeyAsync(string key);
        Task<IEnumerable<Setting>> GetSettingsByCategoryAsync(string category);
        Task<IEnumerable<Setting>> GetSettingsByGroupAsync(string group);
        
        // Ayar kontrolü
        Task<bool> SettingExistsAsync(int id);
        Task<bool> SettingKeyExistsAsync(string key);
        Task<int> GetTotalSettingsCountAsync();
        Task<int> GetSettingsCountByCategoryAsync(string category);
        
        // Arama ve filtreleme
        Task<IEnumerable<Setting>> GetSettingsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<Setting>> GetActiveSettingsAsync();
        
        // İş mantığı
        Task<Setting> UpdateSettingValueAsync(string key, string value);
        Task<bool> ValidateSettingAsync(Setting setting);
        Task<bool> CanUpdateSettingAsync(Setting setting);
        Task<string> GetSettingValueAsync(string key, string defaultValue = "");
        
        // İstatistikler
        Task<Dictionary<string, int>> GetSettingsByCategoryDistributionAsync();
        Task<Dictionary<string, int>> GetSettingsByGroupDistributionAsync();
        Task<IEnumerable<Setting>> GetRecentSettingsAsync(int count);
        Task<bool> InitializeDefaultSettingsAsync();
    }
}
