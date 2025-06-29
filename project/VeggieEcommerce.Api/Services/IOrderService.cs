using VeggieEcommerce.Api.DTOs;
using VeggieEcommerce.Api.Models;

namespace VeggieEcommerce.Api.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto);
        Task<IEnumerable<OrderDto>> GetOrdersByUserAsync(int userId);
        Task<OrderDto?> GetOrderByIdAsync(int id);
        Task<OrderDto> CancelOrderAsync(int orderId);
        Task<OrderDto> UpdateOrderStatusAsync(int orderId, OrderStatus status);
        Task<bool> DeleteOrderAsync(int orderId);
    }
}