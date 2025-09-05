using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<IEnumerable<User>> GetUsersByRoleAsync(string role);

        Task<IEnumerable<User>> GetActiveUsersAsync();
        Task<User> CreateUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> UserExistsAsync(int id);
        Task<bool> EmailExistsAsync(string email);
        Task<IEnumerable<UserPermission>> GetUserPermissionsAsync(int userId);
        Task<bool> AddUserPermissionAsync(int userId, string permission);
        Task<bool> RemoveUserPermissionAsync(int userId, string permission);
        Task<bool> HasPermissionAsync(int userId, string permission);
        Task<int> GetTotalUsersCountAsync();
        Task<IEnumerable<User>> GetUsersWithPaginationAsync(int page, int pageSize);
    }
}
