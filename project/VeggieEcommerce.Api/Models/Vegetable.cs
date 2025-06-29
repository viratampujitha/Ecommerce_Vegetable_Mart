using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieEcommerce.Api.Models
{
    public class Vegetable
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        
        [Required]
        public string ImageUrl { get; set; } = string.Empty;
        
        [Required]
        public int CategoryId { get; set; }
        
        public bool InStock { get; set; } = true;
        public int StockQuantity { get; set; }
        
        [Required]
        public string Unit { get; set; } = string.Empty; // kg, piece, bunch, etc.
        
        public string? NutritionInfo { get; set; }
        public string? Origin { get; set; }
        public bool IsOrganic { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Category Category { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}