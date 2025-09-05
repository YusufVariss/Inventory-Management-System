using System.ComponentModel.DataAnnotations;

namespace GoStock.Models.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ProductDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<StockMovementDto> StockMovements { get; set; } = new();
        public List<SaleDto> Sales { get; set; } = new();
        public List<ReturnDto> Returns { get; set; } = new();
    }

    public class CriticalStockDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int CriticalStockLevel { get; set; }
        public int ReorderPoint { get; set; }
        public int RequiredQuantity { get; set; }
        public decimal TotalValue { get; set; }
        public string StockStatus { get; set; } = string.Empty;
        public DateTime LastStockMovement { get; set; }
        public bool IsActive { get; set; }
    }
}
