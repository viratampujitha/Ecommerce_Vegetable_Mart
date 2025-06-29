using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieEcommerce.Api.Models
{
    public class Order
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }
        
        [Required]
        public string ShippingAddress { get; set; } = string.Empty;
        
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;
        
        public string? Notes { get; set; }
        
        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
    
    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }
}