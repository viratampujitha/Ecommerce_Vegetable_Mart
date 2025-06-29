namespace VeggieEcommerce.Api.DTOs
{
    public class VegetableDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool InStock { get; set; }
        public int StockQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string? NutritionInfo { get; set; }
        public string? Origin { get; set; }
        public bool IsOrganic { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}