using VeggieEcommerce.Api.Models;

namespace VeggieEcommerce.Api.DTOs
{
    public class CreateOrderDto
    {
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }
    
    public class OrderItemDto
    {
        public int VegetableId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
    
    public class OrderDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<OrderItemDetailDto> Items { get; set; } = new List<OrderItemDetailDto>();
    }
    
    public class OrderItemDetailDto
    {
        public int Id { get; set; }
        public int VegetableId { get; set; }
        public string VegetableName { get; set; } = string.Empty;
        public string VegetableImageUrl { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Subtotal { get; set; }
    }
}