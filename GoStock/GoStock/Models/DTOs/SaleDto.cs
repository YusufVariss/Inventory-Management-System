using System.ComponentModel.DataAnnotations;

namespace GoStock.Models.DTOs
{
    public class SaleDto
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime SaleDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
