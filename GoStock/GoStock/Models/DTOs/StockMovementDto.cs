using System.ComponentModel.DataAnnotations;

namespace GoStock.Models.DTOs
{
    public class StockMovementDto
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int PreviousStock { get; set; }
        public int NewStock { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
        public DateTime MovementDate { get; set; }
        public int? UserId { get; set; }
        
        // Related data
        public ProductInfoDto? Product { get; set; }
        public UserInfoDto? User { get; set; }
    }

    public class ProductInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class UserInfoDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class StockMovementCreateDto
    {
        [Required(ErrorMessage = "Ürün ID zorunludur")]
        public int? ProductId { get; set; }
        
        [Required(ErrorMessage = "Hareket tipi zorunludur")]
        public string MovementType { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Miktar zorunludur")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar 1'den büyük olmalıdır")]
        public int Quantity { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan küçük olamaz")]
        public decimal? UnitPrice { get; set; }
        
        [StringLength(100, ErrorMessage = "Referans en fazla 100 karakter olabilir")]
        public string? Reference { get; set; }
        
        [StringLength(500, ErrorMessage = "Notlar en fazla 500 karakter olabilir")]
        public string? Notes { get; set; }
    }

    public class StockMovementUpdateDto
    {
        [Required(ErrorMessage = "ID zorunludur")]
        public int Id { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan küçük olamaz")]
        public decimal? UnitPrice { get; set; }
        
        [StringLength(100, ErrorMessage = "Referans en fazla 100 karakter olabilir")]
        public string? Reference { get; set; }
        
        [StringLength(500, ErrorMessage = "Notlar en fazla 500 karakter olabilir")]
        public string? Notes { get; set; }
    }

    public class StockMovementSummaryDto
    {
        public int TotalMovements { get; set; }
        public int TotalIn { get; set; }
        public int TotalOut { get; set; }
        public int NetChange { get; set; }
        public decimal TotalValue { get; set; }
        public int MonthlyMovements { get; set; }
        public int MonthlyIn { get; set; }
        public int MonthlyOut { get; set; }
    }

    public class StockMovementFilterDto
    {
        public string? SearchTerm { get; set; }
        public string? MovementType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ProductId { get; set; }
        public int? UserId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
