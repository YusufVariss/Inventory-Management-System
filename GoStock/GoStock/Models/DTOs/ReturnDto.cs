using System.ComponentModel.DataAnnotations;

namespace GoStock.Models.DTOs
{
    public class ReturnDto
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public string ReturnType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime ReturnDate { get; set; }
        public string? Reason { get; set; }
    }
}
