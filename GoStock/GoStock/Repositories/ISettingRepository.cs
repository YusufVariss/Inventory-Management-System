using GoStock.Models;

namespace GoStock.Repositories
{
    public interface ISettingRepository
    {
        Task<IEnumerable<Setting>> GetAllSettingsAsync();
        Task<Setting?> GetSettingByIdAsync(int id);
        Task<Setting?> GetSettingByKeyAsync(string key);
        Task<string?> GetSettingValueAsync(string key);
        Task<Setting> CreateSettingAsync(Setting setting);
        Task<Setting> UpdateSettingAsync(Setting setting);
        Task<bool> DeleteSettingAsync(int id);
        Task<bool> SettingExistsAsync(int id);
        Task<bool> SettingKeyExistsAsync(string key);
        Task<int> GetTotalSettingsCountAsync();
        Task<IEnumerable<Setting>> GetSettingsWithPaginationAsync(int page, int pageSize);
        Task<IEnumerable<Setting>> GetSettingsByCategoryAsync(string category);
        Task<bool> UpdateSettingValueAsync(string key, string value);
        Task<Dictionary<string, string>> GetSettingsAsDictionaryAsync();
        Task<IEnumerable<Setting>> GetActiveSettingsAsync();
        Task<bool> BulkUpdateSettingsAsync(Dictionary<string, string> settings);
        Task<IEnumerable<Setting>> GetSettingsByGroupAsync(string group);
        Task<int> GetSettingsCountByCategoryAsync(string category);
        Task<IEnumerable<Setting>> GetSettingsByCategoryAndGroupAsync(string category, string group);
        Task<bool> ActivateSettingAsync(string key);
        Task<bool> DeactivateSettingAsync(string key);
    }
}
