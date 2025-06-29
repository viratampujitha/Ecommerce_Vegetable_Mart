using System.ComponentModel.DataAnnotations;

namespace VeggieEcommerce.Api.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        
        // Navigation properties
        public ICollection<Vegetable> Vegetables { get; set; } = new List<Vegetable>();
    }
}