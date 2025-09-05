using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class SettingService : ISettingService
    {
        private readonly ISettingRepository _settingRepository;
        private readonly ILogger<SettingService> _logger;

        public SettingService(
            ISettingRepository settingRepository,
            ILogger<SettingService> logger)
        {
            _settingRepository = settingRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<Setting>> GetAllSettingsAsync()
        {
            try
            {
                return await _settingRepository.GetAllSettingsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayarlar getirilirken hata oluştu");
                throw new Exception("Ayarlar getirilemedi");
            }
        }

        public async Task<Setting?> GetSettingByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ayar ID");

            try
            {
                return await _settingRepository.GetSettingByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar ID: {SettingId} getirilirken hata oluştu", id);
                throw new Exception("Ayar getirilemedi");
            }
        }

        public async Task<Setting> CreateSettingAsync(Setting setting)
        {
            if (setting == null)
                throw new ArgumentNullException(nameof(setting));

            if (string.IsNullOrWhiteSpace(setting.Key))
                throw new ArgumentException("Ayar anahtarı zorunludur");

            if (string.IsNullOrWhiteSpace(setting.Value))
                throw new ArgumentException("Ayar değeri zorunludur");

            // Ayar doğrulaması
            if (!await ValidateSettingAsync(setting))
                throw new Exception("Ayar doğrulanamadı");

            // Anahtar zaten var mı kontrol et
            if (await SettingKeyExistsAsync(setting.Key))
                throw new Exception("Bu anahtar zaten mevcut");

            try
            {
                setting.CreatedAt = DateTime.Now;
                setting.UpdatedAt = DateTime.Now;

                var createdSetting = await _settingRepository.CreateSettingAsync(setting);
                _logger.LogInformation("Yeni ayar oluşturuldu: {Key}", setting.Key);
                return createdSetting;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar oluşturulurken hata: {Key}", setting.Key);
                throw new Exception("Ayar oluşturulamadı");
            }
        }

        public async Task<Setting> UpdateSettingAsync(Setting setting)
        {
            if (setting == null)
                throw new ArgumentNullException(nameof(setting));

            if (setting.Id <= 0)
                throw new ArgumentException("Geçersiz ayar ID");

            if (!await _settingRepository.SettingExistsAsync(setting.Id))
                throw new Exception("Ayar bulunamadı");

            try
            {
                setting.UpdatedAt = DateTime.Now;

                var updatedSetting = await _settingRepository.UpdateSettingAsync(setting);
                _logger.LogInformation("Ayar güncellendi: {SettingId}", setting.Id);
                return updatedSetting;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar güncellenirken hata: {SettingId}", setting.Id);
                throw new Exception("Ayar güncellenemedi");
            }
        }

        public async Task<bool> DeleteSettingAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ayar ID");

            try
            {
                var result = await _settingRepository.DeleteSettingAsync(id);
                if (result)
                {
                    _logger.LogInformation("Ayar silindi: {SettingId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar silinirken hata: {SettingId}", id);
                throw new Exception("Ayar silinemedi");
            }
        }

        // Ayar yönetimi
        public async Task<Setting?> GetSettingByKeyAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Ayar anahtarı belirtilmelidir");

            try
            {
                return await _settingRepository.GetSettingByKeyAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar anahtarı getirilirken hata: {Key}", key);
                throw new Exception("Ayar anahtarı getirilemedi");
            }
        }

        public async Task<IEnumerable<Setting>> GetSettingsByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("Kategori belirtilmelidir");

            try
            {
                return await _settingRepository.GetSettingsByCategoryAsync(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ayarları getirilirken hata: {Category}", category);
                throw new Exception("Kategori ayarları getirilemedi");
            }
        }

        public async Task<IEnumerable<Setting>> GetSettingsByGroupAsync(string group)
        {
            if (string.IsNullOrWhiteSpace(group))
                throw new ArgumentException("Grup belirtilmelidir");

            try
            {
                return await _settingRepository.GetSettingsByGroupAsync(group);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Grup ayarları getirilirken hata: {Group}", group);
                throw new Exception("Grup ayarları getirilemedi");
            }
        }

        // Ayar kontrolü
        public async Task<bool> SettingExistsAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz ayar ID");

            try
            {
                return await _settingRepository.SettingExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar varlık kontrolü yapılırken hata: {SettingId}", id);
                throw new Exception("Ayar varlık kontrolü yapılamadı");
            }
        }

        public async Task<bool> SettingKeyExistsAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Ayar anahtarı belirtilmelidir");

            try
            {
                var setting = await _settingRepository.GetSettingByKeyAsync(key);
                return setting != null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar anahtarı varlık kontrolü yapılırken hata: {Key}", key);
                throw new Exception("Ayar anahtarı varlık kontrolü yapılamadı");
            }
        }

        public async Task<int> GetTotalSettingsCountAsync()
        {
            try
            {
                return await _settingRepository.GetTotalSettingsCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam ayar sayısı getirilirken hata");
                throw new Exception("Toplam ayar sayısı getirilemedi");
            }
        }

        public async Task<int> GetSettingsCountByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("Kategori belirtilmelidir");

            try
            {
                return await _settingRepository.GetSettingsCountByCategoryAsync(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori ayar sayısı getirilirken hata: {Category}", category);
                throw new Exception("Kategori ayar sayısı getirilemedi");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<Setting>> GetSettingsWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _settingRepository.GetSettingsWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı ayar listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Ayar listesi getirilemedi");
            }
        }

        public async Task<IEnumerable<Setting>> GetActiveSettingsAsync()
        {
            try
            {
                var allSettings = await _settingRepository.GetAllSettingsAsync();
                return allSettings.Where(s => s.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif ayarlar getirilirken hata");
                throw new Exception("Aktif ayarlar getirilemedi");
            }
        }

        // İş mantığı
        public async Task<Setting> UpdateSettingValueAsync(string key, string value)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Ayar anahtarı belirtilmelidir");

            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Ayar değeri belirtilmelidir");

            try
            {
                var setting = await _settingRepository.GetSettingByKeyAsync(key);
                if (setting == null)
                    throw new Exception("Ayar bulunamadı");

                setting.Value = value;
                setting.UpdatedAt = DateTime.Now;

                var updatedSetting = await _settingRepository.UpdateSettingAsync(setting);
                _logger.LogInformation("Ayar değeri güncellendi: {Key} - {Value}", key, value);
                
                return updatedSetting;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar değeri güncellenirken hata: {Key} - {Value}", key, value);
                throw new Exception("Ayar değeri güncellenemedi");
            }
        }

        public Task<bool> ValidateSettingAsync(Setting setting)
        {
            if (setting == null)
                return Task.FromResult(false);

            try
            {
                // Anahtar belirtilmiş mi
                if (string.IsNullOrWhiteSpace(setting.Key))
                    return Task.FromResult(false);

                // Değer belirtilmiş mi
                if (string.IsNullOrWhiteSpace(setting.Value))
                    return Task.FromResult(false);

                // Kategori belirtilmiş mi
                if (string.IsNullOrWhiteSpace(setting.Category))
                    return Task.FromResult(false);

                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar doğrulaması yapılırken hata");
                return Task.FromResult(false);
            }
        }

        public async Task<bool> CanUpdateSettingAsync(Setting setting)
        {
            if (setting == null)
                return false;

            try
            {
                return await ValidateSettingAsync(setting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar güncellenebilirlik kontrolü yapılırken hata");
                return false;
            }
        }

        public async Task<string> GetSettingValueAsync(string key, string defaultValue = "")
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Ayar anahtarı belirtilmelidir");

            try
            {
                var setting = await _settingRepository.GetSettingByKeyAsync(key);
                return setting?.Value ?? defaultValue;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar değeri getirilirken hata: {Key}", key);
                return defaultValue;
            }
        }

        // İstatistikler
        public async Task<Dictionary<string, int>> GetSettingsByCategoryDistributionAsync()
        {
            try
            {
                var allSettings = await _settingRepository.GetAllSettingsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var setting in allSettings)
                {
                    var category = setting.Category ?? "Unknown";
                    if (distribution.ContainsKey(category))
                        distribution[category]++;
                    else
                        distribution[category] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar kategori dağılımı hesaplanırken hata");
                throw new Exception("Ayar kategori dağılımı hesaplanamadı");
            }
        }

        public async Task<Dictionary<string, int>> GetSettingsByGroupDistributionAsync()
        {
            try
            {
                var allSettings = await _settingRepository.GetAllSettingsAsync();
                var distribution = new Dictionary<string, int>();

                foreach (var setting in allSettings)
                {
                    var group = setting.Group ?? "Genel";

                    if (distribution.ContainsKey(group))
                        distribution[group]++;
                    else
                        distribution[group] = 1;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ayar grup dağılımı hesaplanırken hata");
                throw new Exception("Ayar grup dağılımı hesaplanamadı");
            }
        }

        public async Task<IEnumerable<Setting>> GetRecentSettingsAsync(int count)
        {
            if (count <= 0)
                throw new ArgumentException("Sayı 0'dan büyük olmalıdır");

            try
            {
                var allSettings = await _settingRepository.GetAllSettingsAsync();
                return allSettings
                    .OrderByDescending(s => s.UpdatedAt)
                    .Take(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Son ayarlar getirilirken hata: {Count}", count);
                throw new Exception("Son ayarlar getirilemedi");
            }
        }

        public async Task<bool> InitializeDefaultSettingsAsync()
        {
            try
            {
                var defaultSettings = new List<Setting>
                {
                    new Setting
                    {
                        Key = "CompanyName",
                        Value = "GoStock",
                        Category = "Company",
                        Group = "General",
                        Description = "Şirket adı",
                        IsActive = true
                    },
                    new Setting
                    {
                        Key = "CompanyEmail",
                        Value = "info@gostock.com",
                        Category = "Company",
                        Group = "General",
                        Description = "Şirket e-posta adresi",
                        IsActive = true
                    },
                    new Setting
                    {
                        Key = "DefaultCurrency",
                        Value = "TRY",
                        Category = "Financial",
                        Group = "Currency",
                        Description = "Varsayılan para birimi",
                        IsActive = true
                    },
                    new Setting
                    {
                        Key = "LowStockThreshold",
                        Value = "10",
                        Category = "Inventory",
                        Group = "Stock",
                        Description = "Düşük stok eşiği",
                        IsActive = true
                    },
                    new Setting
                    {
                        Key = "MaxLoginAttempts",
                        Value = "3",
                        Category = "Security",
                        Group = "Authentication",
                        Description = "Maksimum giriş denemesi",
                        IsActive = true
                    }
                };

                foreach (var setting in defaultSettings)
                {
                    if (!await SettingKeyExistsAsync(setting.Key))
                    {
                        await CreateSettingAsync(setting);
                    }
                }

                _logger.LogInformation("Varsayılan ayarlar başlatıldı");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Varsayılan ayarlar başlatılırken hata");
                return false;
            }
        }
    }
}
