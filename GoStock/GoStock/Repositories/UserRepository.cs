using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly GoStockDbContext _context;

        public UserRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .OrderBy(u => u.Username)
                .ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string role)
        {
            return await _context.Users
                .Where(u => u.Role == role)
                .OrderBy(u => u.Username)
                .ToListAsync();
        }



        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            return await _context.Users
                .Where(u => u.IsActive)
                .OrderBy(u => u.Username)
                .ToListAsync();
        }

        public async Task<User> CreateUserAsync(User user)
        {
            user.CreatedAt = DateTime.Now;
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            
            return user;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> UserExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(u => u.Id == id);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<UserPermission>> GetUserPermissionsAsync(int userId)
        {
            return await _context.UserPermissions
                .Where(up => up.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> AddUserPermissionAsync(int userId, string permission)
        {
            var existingPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.Permission == permission);

            if (existingPermission != null)
                return false;

            var userPermission = new UserPermission
            {
                UserId = userId,
                Permission = permission
            };

            _context.UserPermissions.Add(userPermission);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> RemoveUserPermissionAsync(int userId, string permission)
        {
            var userPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.Permission == permission);

            if (userPermission == null)
                return false;

            _context.UserPermissions.Remove(userPermission);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> HasPermissionAsync(int userId, string permission)
        {
            return await _context.UserPermissions
                .AnyAsync(up => up.UserId == userId && up.Permission == permission);
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _context.Users.CountAsync();
        }

        public async Task<IEnumerable<User>> GetUsersWithPaginationAsync(int page, int pageSize)
        {
            return await _context.Users
                .Include(u => u.UserPermissions)
                .OrderBy(u => u.Username)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
