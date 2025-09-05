using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GoStock.Models.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "E-posta zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Şifre en az 5 karakter olmalıdır")]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = new();
    }

    public class RegisterRequest
    {
        [Required(ErrorMessage = "Kullanıcı adı zorunludur")]
        [StringLength(100, ErrorMessage = "Kullanıcı adı en fazla 100 karakter olabilir")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ad soyad zorunludur")]
        [StringLength(100, ErrorMessage = "Ad soyad en fazla 100 karakter olabilir")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-posta zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre tekrarı zorunludur")]
        [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor")]
        public string ConfirmPassword { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Rol zorunludur")]
        [StringLength(20, ErrorMessage = "Rol en fazla 20 karakter olabilir")]
        public string Role { get; set; } = "user";
    }

    public class RefreshTokenRequest
    {
        [Required(ErrorMessage = "Refresh token zorunludur")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class LogoutRequest
    {
        public int? UserId { get; set; }
        public string? UserEmail { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Mevcut şifre zorunludur")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Yeni şifre zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre tekrarı zorunludur")]
        [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}
