using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VeggieEcommerce.Api.DTOs;
using VeggieEcommerce.Api.Services;
using VeggieEcommerce.Api.Models;

namespace VeggieEcommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;
        
        public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }
        
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto createOrderDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Invalid user ID in token: {UserIdClaim}", userIdClaim);
                    return Unauthorized(new { message = "Invalid user token" });
                }

                _logger.LogInformation("Creating order for user {UserId} with {ItemCount} items", userId, createOrderDto.Items?.Count ?? 0);

                // Log the incoming order data for debugging
                _logger.LogInformation("Order data: ShippingAddress={ShippingAddress}, PaymentMethod={PaymentMethod}, Items={@Items}", 
                    createOrderDto.ShippingAddress, createOrderDto.PaymentMethod, createOrderDto.Items);

                // Validate the order data
                if (createOrderDto.Items == null || !createOrderDto.Items.Any())
                {
                    _logger.LogWarning("Order validation failed: No items");
                    return BadRequest(new { message = "Order must contain at least one item" });
                }

                if (string.IsNullOrWhiteSpace(createOrderDto.ShippingAddress))
                {
                    _logger.LogWarning("Order validation failed: No shipping address");
                    return BadRequest(new { message = "Shipping address is required" });
                }

                if (string.IsNullOrWhiteSpace(createOrderDto.PaymentMethod))
                {
                    _logger.LogWarning("Order validation failed: No payment method");
                    return BadRequest(new { message = "Payment method is required" });
                }

                // Additional validation for item data
                foreach (var item in createOrderDto.Items)
                {
                    if (item.VegetableId <= 0)
                    {
                        _logger.LogWarning("Order validation failed: Invalid vegetable ID {VegetableId}", item.VegetableId);
                        return BadRequest(new { message = $"Invalid vegetable ID: {item.VegetableId}" });
                    }
                    if (item.Quantity <= 0)
                    {
                        _logger.LogWarning("Order validation failed: Invalid quantity {Quantity} for vegetable {VegetableId}", item.Quantity, item.VegetableId);
                        return BadRequest(new { message = $"Quantity must be greater than 0 for vegetable {item.VegetableId}" });
                    }
                    if (item.Price <= 0)
                    {
                        _logger.LogWarning("Order validation failed: Invalid price {Price} for vegetable {VegetableId}", item.Price, item.VegetableId);
                        return BadRequest(new { message = $"Price must be greater than 0 for vegetable {item.VegetableId}" });
                    }
                }

                var order = await _orderService.CreateOrderAsync(userId, createOrderDto);
                
                _logger.LogInformation("Order {OrderId} created successfully for user {UserId}", order.Id, userId);
                
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order: {Message}. Inner exception: {InnerException}", 
                    ex.Message, ex.InnerException?.Message);
                
                // Return more specific error messages based on the exception type
                if (ex.Message.Contains("not found"))
                {
                    return BadRequest(new { message = ex.Message });
                }
                
                if (ex.Message.Contains("out of stock") || ex.Message.Contains("Insufficient stock"))
                {
                    return BadRequest(new { message = ex.Message });
                }
                
                if (ex.Message.Contains("too long"))
                {
                    return BadRequest(new { message = ex.Message });
                }

                // For database-related errors, provide a generic message but log the details
                if (ex.InnerException != null && (
                    ex.InnerException.Message.Contains("constraint") ||
                    ex.InnerException.Message.Contains("foreign key") ||
                    ex.InnerException.Message.Contains("duplicate") ||
                    ex.InnerException.Message.Contains("cannot insert")))
                {
                    _logger.LogError("Database constraint error: {InnerMessage}", ex.InnerException.Message);
                    return BadRequest(new { message = "Database validation error. Please check your order data and try again." });
                }
                
                return StatusCode(500, new { 
                    message = "An error occurred while creating the order. Please try again.",
                    details = ex.Message // Include details for debugging
                });
            }
        }
        
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders(int userId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                if (currentUserId != userId)
                {
                    _logger.LogWarning("User {CurrentUserId} attempted to access orders for user {RequestedUserId}", currentUserId, userId);
                    return Forbid();
                }
                
                var orders = await _orderService.GetOrdersByUserAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user {UserId}: {Message}", userId, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving orders." });
            }
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }
                    
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                if (currentUserId != order.UserId)
                {
                    _logger.LogWarning("User {CurrentUserId} attempted to access order {OrderId} belonging to user {OrderUserId}", currentUserId, id, order.UserId);
                    return Forbid();
                }
                    
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving the order." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteOrder(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                _logger.LogInformation("User {UserId} attempting to delete order {OrderId}", currentUserId, id);

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                if (currentUserId != order.UserId)
                {
                    _logger.LogWarning("User {CurrentUserId} attempted to delete order {OrderId} belonging to user {OrderUserId}", currentUserId, id, order.UserId);
                    return Forbid();
                }

                // Check if order can be deleted
                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
                {
                    return BadRequest(new { message = $"Order cannot be deleted. Current status: {order.Status}. Only pending or confirmed orders can be deleted." });
                }

                var success = await _orderService.DeleteOrderAsync(id);
                
                if (success)
                {
                    _logger.LogInformation("Order {OrderId} deleted successfully by user {UserId}", id, currentUserId);
                    return Ok(new { message = "Order deleted successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Failed to delete order" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting order {OrderId}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while deleting the order." });
            }
        }

        [HttpPut("{id}/cancel")]
        public async Task<ActionResult<OrderDto>> CancelOrder(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                _logger.LogInformation("User {UserId} attempting to cancel order {OrderId}", currentUserId, id);

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                if (currentUserId != order.UserId)
                {
                    _logger.LogWarning("User {CurrentUserId} attempted to cancel order {OrderId} belonging to user {OrderUserId}", currentUserId, id, order.UserId);
                    return Forbid();
                }

                // Check if order can be cancelled
                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
                {
                    return BadRequest(new { message = $"Order cannot be cancelled. Current status: {order.Status}" });
                }

                var cancelledOrder = await _orderService.CancelOrderAsync(id);
                
                _logger.LogInformation("Order {OrderId} cancelled successfully by user {UserId}", id, currentUserId);
                
                return Ok(cancelledOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while cancelling the order." });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateStatusDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                _logger.LogInformation("User {UserId} attempting to update status of order {OrderId} to {Status}", currentUserId, id, updateStatusDto.Status);

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                if (currentUserId != order.UserId)
                {
                    _logger.LogWarning("User {CurrentUserId} attempted to update order {OrderId} belonging to user {OrderUserId}", currentUserId, id, order.UserId);
                    return Forbid();
                }

                var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto.Status);
                
                _logger.LogInformation("Order {OrderId} status updated successfully by user {UserId}", id, currentUserId);
                
                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order {OrderId} status: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while updating the order status." });
            }
        }
    }

    public class UpdateOrderStatusDto
    {
        public OrderStatus Status { get; set; }
    }
}