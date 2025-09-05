using GoStock.Models;

namespace GoStock.Services
{
    public interface IUserService
    {
        // Temel CRUD işlemleri
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user, List<string> permissions);
        Task<User> CreateUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int id);
        
        // Kullanıcı yönetimi
        Task<IEnumerable<User>> GetUsersByRoleAsync(string role);
        Task<IEnumerable<User>> GetActiveUsersAsync();
        Task<bool> DeactivateUserAsync(int id);
        Task<bool> ActivateUserAsync(int id);
        
        // Yetki yönetimi
        Task<IEnumerable<UserPermission>> GetUserPermissionsAsync(int userId);
        Task<bool> AddUserPermissionAsync(int userId, string permission);
        Task<bool> RemoveUserPermissionAsync(int userId, string permission);
        Task<bool> HasPermissionAsync(int userId, string permission);
        Task<bool> HasAnyPermissionAsync(int userId, List<string> permissions);
        Task<bool> HasAllPermissionsAsync(int userId, List<string> permissions);
        
        // Arama ve filtreleme
        Task<IEnumerable<User>> SearchUsersAsync(string searchTerm);
        Task<IEnumerable<User>> GetUsersWithPaginationAsync(int page, int pageSize);
        Task<int> GetTotalUsersCountAsync();
        
        // Kullanıcı durumu
        Task<bool> UpdateUserStatusAsync(int userId, bool isActive);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        
        // Doğrulama
        Task<bool> ValidateUserCredentialsAsync(string email, string password);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeUserId = null);
    }
}
