using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcılar getirilirken hata oluştu");
                return StatusCode(500, "Kullanıcılar getirilemedi");
            }
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                    return NotFound($"ID: {id} olan kullanıcı bulunamadı");

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID: {UserId} getirilirken hata oluştu", id);
                return StatusCode(500, "Kullanıcı getirilemedi");
            }
        }

        // GET: api/Users/email/test@example.com
        [HttpGet("email/{email}")]
        public async Task<ActionResult<User>> GetUserByEmail(string email)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(email);
                if (user == null)
                    return NotFound($"E-posta: {email} olan kullanıcı bulunamadı");

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "E-posta: {Email} kullanıcısı getirilirken hata oluştu", email);
                return StatusCode(500, "Kullanıcı getirilemedi");
            }
        }

        // GET: api/Users/role/admin
        [HttpGet("role/{role}")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsersByRole(string role)
        {
            try
            {
                var users = await _userService.GetUsersByRoleAsync(role);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rol: {Role} kullanıcıları getirilirken hata oluştu", role);
                return StatusCode(500, "Kullanıcılar getirilemedi");
            }
        }

        // GET: api/Users/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<User>>> GetActiveUsers()
        {
            try
            {
                var users = await _userService.GetActiveUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif kullanıcılar getirilirken hata oluştu");
                return StatusCode(500, "Aktif kullanıcılar getirilemedi");
            }
        }

        // GET: api/Users/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetUsersCount()
        {
            try
            {
                var count = await _userService.GetTotalUsersCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı sayısı getirilirken hata oluştu");
                return StatusCode(500, "Kullanıcı sayısı getirilemedi");
            }
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Tarih alanlarını set et
                user.CreatedAt = DateTime.Now;
                user.UpdatedAt = DateTime.Now;

                var createdUser = await _userService.CreateUserAsync(user);
                return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı oluşturulurken hata: {Email}", user.Email);
                return StatusCode(500, "Kullanıcı oluşturulamadı");
            }
        }



        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            try
            {
                if (id != user.Id)
                    return BadRequest("ID uyuşmazlığı");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedUser = await _userService.UpdateUserAsync(user);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı güncellenirken hata: {UserId}", id);
                return StatusCode(500, "Kullanıcı güncellenemedi");
            }
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan kullanıcı bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı silinirken hata: {UserId}", id);
                return StatusCode(500, "Kullanıcı silinemedi");
            }
        }

        // POST: api/Users/5/activate
        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateUser(int id)
        {
            try
            {
                var result = await _userService.ActivateUserAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan kullanıcı bulunamadı");

                return Ok("Kullanıcı aktifleştirildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı aktifleştirilirken hata: {UserId}", id);
                return StatusCode(500, "Kullanıcı aktifleştirilemedi");
            }
        }

        // POST: api/Users/5/deactivate
        [HttpPost("{id}/deactivate")]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            try
            {
                var result = await _userService.DeactivateUserAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan kullanıcı bulunamadı");

                return Ok("Kullanıcı deaktifleştirildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı deaktifleştirilirken hata: {UserId}", id);
                return StatusCode(500, "Kullanıcı deaktifleştirilemedi");
            }
        }

        // POST: api/Users/5/change-password
        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _userService.ChangePasswordAsync(id, request.CurrentPassword, request.NewPassword);
                if (!result)
                    return BadRequest("Mevcut şifre yanlış");

                return Ok("Şifre başarıyla değiştirildi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre değiştirilirken hata: {UserId}", id);
                return StatusCode(500, "Şifre değiştirilemedi");
            }
        }

        // GET: api/Users/5/permissions
        [HttpGet("{id}/permissions")]
        public async Task<ActionResult<IEnumerable<UserPermission>>> GetUserPermissions(int id)
        {
            try
            {
                var permissions = await _userService.GetUserPermissionsAsync(id);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı izinleri getirilirken hata: {UserId}", id);
                return StatusCode(500, "Kullanıcı izinleri getirilemedi");
            }
        }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
