using GoStock.Repositories;
using GoStock.Models;

namespace GoStock.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        // Temel CRUD işlemleri
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            try
            {
                return await _userRepository.GetAllUsersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcılar getirilirken hata oluştu");
                throw new Exception("Kullanıcılar getirilemedi");
            }
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _userRepository.GetUserByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID: {UserId} getirilirken hata oluştu", id);
                throw new Exception("Kullanıcı getirilemedi");
            }
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email adresi boş olamaz");

            try
            {
                return await _userRepository.GetUserByEmailAsync(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı email: {Email} getirilirken hata oluştu", email);
                throw new Exception("Kullanıcı getirilemedi");
            }
        }

        public async Task<User> CreateUserAsync(User user, List<string> permissions)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new ArgumentException("Email adresi zorunludur");

            if (string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("Şifre zorunludur");

            // Email benzersizlik kontrolü
            if (await _userRepository.EmailExistsAsync(user.Email))
                throw new Exception("Bu email adresi zaten kullanılıyor");

            try
            {
                var createdUser = await _userRepository.CreateUserAsync(user);

                // Yetkileri ekle
                if (permissions != null && permissions.Any())
                {
                    foreach (var permission in permissions)
                    {
                        await _userRepository.AddUserPermissionAsync(createdUser.Id, permission);
                    }
                }

                _logger.LogInformation("Yeni kullanıcı oluşturuldu: {Email}", user.Email);
                return createdUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı oluşturulurken hata: {Email}", user.Email);
                throw new Exception("Kullanıcı oluşturulamadı");
            }
        }

        public async Task<User> CreateUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new ArgumentException("Email adresi zorunludur");

            if (string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("Şifre zorunludur");

            // Email benzersizlik kontrolü
            if (await _userRepository.EmailExistsAsync(user.Email))
                throw new Exception("Bu email adresi zaten kullanılıyor");

            try
            {
                var createdUser = await _userRepository.CreateUserAsync(user);
                _logger.LogInformation("Yeni kullanıcı oluşturuldu: {Email}", user.Email);
                return createdUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı oluşturulurken hata: {Email}", user.Email);
                throw new Exception("Kullanıcı oluşturulamadı");
            }
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (user.Id <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            // Kullanıcının var olup olmadığını kontrol et
            if (!await _userRepository.UserExistsAsync(user.Id))
                throw new Exception("Kullanıcı bulunamadı");

            try
            {
                var updatedUser = await _userRepository.UpdateUserAsync(user);
                _logger.LogInformation("Kullanıcı güncellendi: {UserId}", user.Id);
                return updatedUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı güncellenirken hata: {UserId}", user.Id);
                throw new Exception("Kullanıcı güncellenemedi");
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                var result = await _userRepository.DeleteUserAsync(id);
                if (result)
                {
                    _logger.LogInformation("Kullanıcı silindi: {UserId}", id);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı silinirken hata: {UserId}", id);
                throw new Exception("Kullanıcı silinemedi");
            }
        }

        // Kullanıcı yönetimi
        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string role)
        {
            if (string.IsNullOrWhiteSpace(role))
                throw new ArgumentException("Rol belirtilmelidir");

            try
            {
                return await _userRepository.GetUsersByRoleAsync(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rol: {Role} kullanıcıları getirilirken hata", role);
                throw new Exception("Kullanıcılar getirilemedi");
            }
        }



        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            try
            {
                return await _userRepository.GetActiveUsersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif kullanıcılar getirilirken hata");
                throw new Exception("Aktif kullanıcılar getirilemedi");
            }
        }

        public async Task<bool> DeactivateUserAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                    return false;

                user.IsActive = false;
                await _userRepository.UpdateUserAsync(user);
                
                _logger.LogInformation("Kullanıcı deaktif edildi: {UserId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı deaktif edilirken hata: {UserId}", id);
                throw new Exception("Kullanıcı deaktif edilemedi");
            }
        }

        public async Task<bool> ActivateUserAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                    return false;

                user.IsActive = true;
                await _userRepository.UpdateUserAsync(user);
                
                _logger.LogInformation("Kullanıcı aktif edildi: {UserId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı aktif edilirken hata: {UserId}", id);
                throw new Exception("Kullanıcı aktif edilemedi");
            }
        }

        // Yetki yönetimi
        public async Task<IEnumerable<UserPermission>> GetUserPermissionsAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                return await _userRepository.GetUserPermissionsAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı yetkileri getirilirken hata: {UserId}", userId);
                throw new Exception("Kullanıcı yetkileri getirilemedi");
            }
        }

        public async Task<bool> AddUserPermissionAsync(int userId, string permission)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (string.IsNullOrWhiteSpace(permission))
                throw new ArgumentException("Yetki belirtilmelidir");

            try
            {
                var result = await _userRepository.AddUserPermissionAsync(userId, permission);
                if (result)
                {
                    _logger.LogInformation("Yetki eklendi: {UserId} - {Permission}", userId, permission);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yetki eklenirken hata: {UserId} - {Permission}", userId, permission);
                throw new Exception("Yetki eklenemedi");
            }
        }

        public async Task<bool> RemoveUserPermissionAsync(int userId, string permission)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (string.IsNullOrWhiteSpace(permission))
                throw new ArgumentException("Yetki belirtilmelidir");

            try
            {
                var result = await _userRepository.RemoveUserPermissionAsync(userId, permission);
                if (result)
                {
                    _logger.LogInformation("Yetki kaldırıldı: {UserId} - {Permission}", userId, permission);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yetki kaldırılırken hata: {UserId} - {Permission}", userId, permission);
                throw new Exception("Yetki kaldırılamadı");
            }
        }

        public async Task<bool> HasPermissionAsync(int userId, string permission)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (string.IsNullOrWhiteSpace(permission))
                throw new ArgumentException("Yetki belirtilmelidir");

            try
            {
                return await _userRepository.HasPermissionAsync(userId, permission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yetki kontrolü yapılırken hata: {UserId} - {Permission}", userId, permission);
                throw new Exception("Yetki kontrolü yapılamadı");
            }
        }

        public async Task<bool> HasAnyPermissionAsync(int userId, List<string> permissions)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (permissions == null || !permissions.Any())
                throw new ArgumentException("Yetki listesi boş olamaz");

            try
            {
                foreach (var permission in permissions)
                {
                    if (await _userRepository.HasPermissionAsync(userId, permission))
                        return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yetki kontrolü yapılırken hata: {UserId}", userId);
                throw new Exception("Yetki kontrolü yapılamadı");
            }
        }

        public async Task<bool> HasAllPermissionsAsync(int userId, List<string> permissions)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (permissions == null || !permissions.Any())
                throw new ArgumentException("Yetki listesi boş olamaz");

            try
            {
                foreach (var permission in permissions)
                {
                    if (!await _userRepository.HasPermissionAsync(userId, permission))
                        return false;
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yetki kontrolü yapılırken hata: {UserId}", userId);
                throw new Exception("Yetki kontrolü yapılamadı");
            }
        }

        // Arama ve filtreleme
        public async Task<IEnumerable<User>> SearchUsersAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllUsersAsync();

            try
            {
                var allUsers = await _userRepository.GetAllUsersAsync();
                return allUsers.Where(u => 
                    u.Username.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    u.FullName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    u.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı arama hatası: {SearchTerm}", searchTerm);
                throw new Exception("Kullanıcı arama yapılamadı");
            }
        }

        public async Task<IEnumerable<User>> GetUsersWithPaginationAsync(int page, int pageSize)
        {
            if (page <= 0)
                throw new ArgumentException("Sayfa numarası 0'dan büyük olmalıdır");

            if (pageSize <= 0)
                throw new ArgumentException("Sayfa boyutu 0'dan büyük olmalıdır");

            try
            {
                return await _userRepository.GetUsersWithPaginationAsync(page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı kullanıcı listesi getirilirken hata: {Page} - {PageSize}", page, pageSize);
                throw new Exception("Kullanıcı listesi getirilemedi");
            }
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            try
            {
                return await _userRepository.GetTotalUsersCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Toplam kullanıcı sayısı getirilirken hata");
                throw new Exception("Toplam kullanıcı sayısı getirilemedi");
            }
        }

        // Kullanıcı durumu
        public async Task<bool> UpdateUserStatusAsync(int userId, bool isActive)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null)
                    return false;

                user.IsActive = isActive;
                await _userRepository.UpdateUserAsync(user);
                
                _logger.LogInformation("Kullanıcı durumu güncellendi: {UserId} - {IsActive}", userId, isActive);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı durumu güncellenirken hata: {UserId} - {IsActive}", userId, isActive);
                throw new Exception("Kullanıcı durumu güncellenemedi");
            }
        }



        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            if (userId <= 0)
                throw new ArgumentException("Geçersiz kullanıcı ID");

            if (string.IsNullOrWhiteSpace(currentPassword))
                throw new ArgumentException("Mevcut şifre belirtilmelidir");

            if (string.IsNullOrWhiteSpace(newPassword))
                throw new ArgumentException("Yeni şifre belirtilmelidir");

            if (newPassword.Length < 6)
                throw new ArgumentException("Yeni şifre en az 6 karakter olmalıdır");

            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null)
                    return false;

                // Şifre kontrolü (düz karşılaştırma)
                if (user.Password != currentPassword)
                    return false;

                // Yeni şifreyi ata
                user.Password = newPassword;
                
                await _userRepository.UpdateUserAsync(user);
                
                _logger.LogInformation("Kullanıcı şifresi değiştirildi: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı şifresi değiştirilirken hata: {UserId}", userId);
                throw new Exception("Şifre değiştirilemedi");
            }
        }

        // Doğrulama
        public async Task<bool> ValidateUserCredentialsAsync(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email adresi belirtilmelidir");

            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Şifre belirtilmelidir");

            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                    return false;

                if (!user.IsActive)
                    return false;

                // Şifre kontrolü (düz karşılaştırma)
                return user.Password == password;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı kimlik doğrulaması yapılırken hata: {Email}", email);
                throw new Exception("Kimlik doğrulaması yapılamadı");
            }
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email adresi belirtilmelidir");

            try
            {
                var existingUser = await _userRepository.GetUserByEmailAsync(email);
                if (existingUser == null)
                    return true;

                // Belirli bir kullanıcı hariç tutuluyorsa
                if (excludeUserId.HasValue && existingUser.Id == excludeUserId.Value)
                    return true;

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email benzersizlik kontrolü yapılırken hata: {Email}", email);
                throw new Exception("Email kontrolü yapılamadı");
            }
        }
    }
}
