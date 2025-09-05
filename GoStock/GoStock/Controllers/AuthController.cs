using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GoStock.Models;
using GoStock.Models.DTOs;
using GoStock.Services;
using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, IJwtService jwtService, IAuditLogService auditLogService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _jwtService = jwtService;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        /// <summary>
        /// Kullanıcı girişi
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<LoginResponse>.ErrorResult("Validation hatası", errors));
                }

                var user = await _userService.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    return Unauthorized(ApiResponse<LoginResponse>.ErrorResult("Geçersiz e-posta veya şifre"));
                }

                // Şifre doğrulama (hem düz hem hash'lenmiş şifre ile)
                _logger.LogInformation("Login attempt - Email: {Email}, DB Password: '{DBPassword}', Request Password: '{RequestPassword}'", 
                    request.Email, user.Password, request.Password);
                
                bool isPasswordValid = false;
                
                // Önce düz karşılaştırma (admin kullanıcısı için)
                if (user.Password == request.Password)
                {
                    isPasswordValid = true;
                }
                // Sonra hash karşılaştırma (diğer kullanıcılar için)
                else if (VerifyPassword(request.Password, user.Password))
                {
                    isPasswordValid = true;
                }
                
                if (!isPasswordValid)
                {
                    _logger.LogWarning("Password mismatch for user: {Email}", request.Email);
                    return Unauthorized(ApiResponse<LoginResponse>.ErrorResult("Geçersiz e-posta veya şifre"));
                }

                if (!user.IsActive)
                {
                    return Unauthorized(ApiResponse<LoginResponse>.ErrorResult("Hesabınız aktif değil"));
                }

                var token = _jwtService.GenerateToken(user);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // Update user (optional: you can add last login tracking later)
                await _userService.UpdateUserAsync(user);

                // Giriş aktivitesini audit log'a kaydet
                try
                {
                    await _auditLogService.LogUserActionAsync(
                        user.Id, 
                        "LOGIN", 
                        "Users", 
                        user.Id, 
                        $"Kullanıcı giriş yaptı: {user.FullName} ({user.Email})"
                    );
                }
                catch (Exception auditEx)
                {
                    _logger.LogWarning(auditEx, "Giriş aktivitesi audit log'a kaydedilemedi: {UserId}", user.Id);
                }

                var response = new LoginResponse
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FullName = user.FullName,
                        Role = user.Role,
                        IsActive = user.IsActive,
                        CreatedAt = user.CreatedAt,

                    }
                };

                return Ok(ApiResponse<LoginResponse>.SuccessResult(response, "Giriş başarılı"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Giriş yapılırken hata oluştu");
                return StatusCode(500, ApiResponse<LoginResponse>.ErrorResult("Giriş yapılırken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Kullanıcı çıkışı
        /// </summary>
        [HttpPost("logout")]
        public async Task<ActionResult<ApiResponse<object>>> Logout([FromBody] LogoutRequest? request = null)
        {
            try
            {
                _logger.LogInformation("Logout endpoint'i çağrıldı");
                
                // Önce JWT token'dan kullanıcı bilgilerini almaya çalış
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                int? userId = null;
                
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int tokenUserId))
                {
                    userId = tokenUserId;
                    _logger.LogInformation("User ID token'dan alındı: {UserId}", userId);
                }
                else if (request != null && request.UserId.HasValue)
                {
                    userId = request.UserId.Value;
                    _logger.LogInformation("User ID request'ten alındı: {UserId}", userId);
                }
                
                if (userId.HasValue)
                {
                    var user = await _userService.GetUserByIdAsync(userId.Value);
                    if (user != null)
                    {
                        _logger.LogInformation("Kullanıcı bulundu: {UserFullName} ({UserEmail})", user.FullName, user.Email);
                        
                        // Çıkış aktivitesini audit log'a kaydet
                        try
                        {
                            await _auditLogService.LogUserActionAsync(
                                user.Id, 
                                "LOGOUT", 
                                "Users", 
                                user.Id, 
                                $"Kullanıcı çıkış yaptı: {user.FullName} ({user.Email})"
                            );
                            _logger.LogInformation("✅ Çıkış aktivitesi audit log'a kaydedildi: {UserId}", user.Id);
                        }
                        catch (Exception auditEx)
                        {
                            _logger.LogError(auditEx, "❌ Çıkış aktivitesi audit log'a kaydedilemedi: {UserId}", user.Id);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Kullanıcı bulunamadı: {UserId}", userId);
                    }
                }
                else
                {
                    _logger.LogWarning("User ID bulunamadı - token veya request'ten alınamadı");
                }

                return Ok(ApiResponse<object>.SuccessResult(null, "Çıkış başarılı"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Çıkış yapılırken hata oluştu");
                return StatusCode(500, ApiResponse<object>.ErrorResult("Çıkış yapılırken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Kullanıcı kaydı
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<UserDto>>> Register(RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<UserDto>.ErrorResult("Validation hatası", errors));
                }

                // Check if user already exists
                var existingUser = await _userService.GetUserByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(ApiResponse<UserDto>.ErrorResult("Bu e-posta adresi zaten kullanılıyor"));
                }

                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    Password = request.Password, // Düz şifre
                    FullName = request.FullName,
                    Role = request.Role,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                var createdUser = await _userService.CreateUserAsync(user);

                var userDto = new UserDto
                {
                    Id = createdUser.Id,
                    Username = createdUser.Username,
                    Email = createdUser.Email,
                    FullName = createdUser.FullName,
                    Role = createdUser.Role,
                    IsActive = createdUser.IsActive,
                    CreatedAt = createdUser.CreatedAt
                };

                return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, 
                    ApiResponse<UserDto>.SuccessResult(userDto, "Kullanıcı başarıyla oluşturuldu"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı kaydı yapılırken hata oluştu");
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Kullanıcı kaydı yapılırken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Kullanıcı bilgilerini getir
        /// </summary>
        [HttpGet("user/{id}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResult("Kullanıcı bulunamadı"));
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                };

                return Ok(ApiResponse<UserDto>.SuccessResult(userDto, "Kullanıcı bilgileri başarıyla getirildi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı bilgileri getirilirken hata oluştu");
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Kullanıcı bilgileri getirilirken bir hata oluştu", ex.Message));
            }
        }

        /// <summary>
        /// Token yenileme
        /// </summary>
        [HttpPost("refresh-token")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken(RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<LoginResponse>.ErrorResult("Geçersiz refresh token"));
                }

                var principal = _jwtService.GetPrincipalFromExpiredToken(request.RefreshToken);
                if (principal == null)
                {
                    return BadRequest(ApiResponse<LoginResponse>.ErrorResult("Geçersiz refresh token"));
                }

                var userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest(ApiResponse<LoginResponse>.ErrorResult("Kullanıcı bulunamadı"));
                }

                var newToken = _jwtService.GenerateToken(user);
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                var response = new LoginResponse
                {
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FullName = user.FullName,
                        Role = user.Role,
                        IsActive = user.IsActive,
                        CreatedAt = user.CreatedAt,

                    }
                };

                return Ok(ApiResponse<LoginResponse>.SuccessResult(response, "Token başarıyla yenilendi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token yenilenirken hata oluştu");
                return StatusCode(500, ApiResponse<LoginResponse>.ErrorResult("Token yenilenirken bir hata oluştu", ex.Message));
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == hash;
        }

        /// <summary>
        /// Test hash generation - REMOVE IN PRODUCTION
        /// </summary>
        [HttpPost("test-hash")]
        public ActionResult<string> TestHash([FromBody] string password)
        {
            var hash = HashPassword(password);
            return Ok(new { password = password, hash = hash });
        }

        /// <summary>
        /// Test database connection - REMOVE IN PRODUCTION
        /// </summary>
        [HttpGet("test-db")]
        public async Task<ActionResult<string>> TestDatabase()
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync("admin@test.com");
                if (user != null)
                {
                    return Ok(new { 
                        success = true, 
                        message = "Database connection successful",
                        user = new { 
                            id = user.Id, 
                            email = user.Email, 
                            username = user.Username 
                        }
                    });
                }
                else
                {
                    return Ok(new { 
                        success = false, 
                        message = "User not found but connection successful" 
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Database connection failed", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// JWT token'ın geçerli olup olmadığını kontrol eder
        /// </summary>
        [HttpPost("validate-token")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "Geçersiz token" });
                }

                return Ok(new { 
                    success = true, 
                    message = "Token geçerli",
                    userId = userId,
                    userEmail = userEmail
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token validation hatası");
                return StatusCode(500, new { message = "Token validation hatası" });
            }
        }
    }
}
