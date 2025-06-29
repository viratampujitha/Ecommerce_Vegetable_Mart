using Microsoft.EntityFrameworkCore;
using VeggieEcommerce.Api.Data;
using VeggieEcommerce.Api.DTOs;
using VeggieEcommerce.Api.Models;

namespace VeggieEcommerce.Api.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                _logger.LogInformation("Starting order creation for user {UserId}", userId);

                // Validate user exists
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new Exception($"User with ID {userId} not found");
                }

                _logger.LogInformation("User {UserId} found: {UserEmail}", userId, user.Email);

                // Validate input data
                if (createOrderDto.Items == null || !createOrderDto.Items.Any())
                {
                    throw new Exception("Order must contain at least one item");
                }

                if (string.IsNullOrWhiteSpace(createOrderDto.ShippingAddress))
                {
                    throw new Exception("Shipping address is required");
                }

                if (string.IsNullOrWhiteSpace(createOrderDto.PaymentMethod))
                {
                    throw new Exception("Payment method is required");
                }

                // Validate string lengths before database operations
                var shippingAddress = createOrderDto.ShippingAddress.Trim();
                var paymentMethod = createOrderDto.PaymentMethod.Trim();
                var notes = createOrderDto.Notes?.Trim() ?? string.Empty;

                if (shippingAddress.Length > 1000)
                {
                    throw new Exception("Shipping address is too long (maximum 1000 characters)");
                }

                if (paymentMethod.Length > 100)
                {
                    throw new Exception("Payment method is too long (maximum 100 characters)");
                }

                if (notes.Length > 1000)
                {
                    throw new Exception("Notes are too long (maximum 1000 characters)");
                }

                // Get all vegetables for the order items
                var vegetableIds = createOrderDto.Items.Select(i => i.VegetableId).Distinct().ToList();
                _logger.LogInformation("Loading vegetables: {VegetableIds}", string.Join(", ", vegetableIds));

                var vegetables = await _context.Vegetables
                    .Where(v => vegetableIds.Contains(v.Id))
                    .ToListAsync();

                _logger.LogInformation("Found {VegetableCount} vegetables in database", vegetables.Count);

                if (vegetables.Count != vegetableIds.Count)
                {
                    var missingIds = vegetableIds.Except(vegetables.Select(v => v.Id));
                    throw new Exception($"Vegetables not found: {string.Join(", ", missingIds)}");
                }

                // Validate stock availability
                foreach (var itemDto in createOrderDto.Items)
                {
                    var vegetable = vegetables.FirstOrDefault(v => v.Id == itemDto.VegetableId);
                    if (vegetable == null)
                    {
                        throw new Exception($"Vegetable with ID {itemDto.VegetableId} not found");
                    }

                    if (!vegetable.InStock)
                    {
                        throw new Exception($"Vegetable '{vegetable.Name}' is out of stock");
                    }

                    if (vegetable.StockQuantity < itemDto.Quantity)
                    {
                        throw new Exception($"Insufficient stock for '{vegetable.Name}'. Available: {vegetable.StockQuantity}, Requested: {itemDto.Quantity}");
                    }
                }

                // Calculate total amount using current vegetable prices
                decimal totalAmount = 0;
                foreach (var itemDto in createOrderDto.Items)
                {
                    var vegetable = vegetables.First(v => v.Id == itemDto.VegetableId);
                    totalAmount += itemDto.Quantity * vegetable.Price;
                }

                _logger.LogInformation("Calculated total amount: {TotalAmount}", totalAmount);

                // Create the order
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    ShippingAddress = shippingAddress,
                    PaymentMethod = paymentMethod,
                    Notes = notes,
                    TotalAmount = totalAmount
                };

                _logger.LogInformation("Adding order to database");
                _context.Orders.Add(order);
                
                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Order saved with ID {OrderId}", order.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save order: {Message}", ex.Message);
                    throw new Exception($"Failed to save order: {ex.Message}", ex);
                }

                // Create order items
                var orderItems = new List<OrderItem>();
                foreach (var itemDto in createOrderDto.Items)
                {
                    var vegetable = vegetables.First(v => v.Id == itemDto.VegetableId);
                    
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        VegetableId = itemDto.VegetableId,
                        Quantity = itemDto.Quantity,
                        Price = vegetable.Price, // Use current vegetable price
                        Subtotal = itemDto.Quantity * vegetable.Price
                    };

                    orderItems.Add(orderItem);
                    _context.OrderItems.Add(orderItem);

                    // Update stock
                    vegetable.StockQuantity -= itemDto.Quantity;
                    if (vegetable.StockQuantity <= 0)
                    {
                        vegetable.InStock = false;
                        vegetable.StockQuantity = 0;
                    }

                    _logger.LogInformation("Added order item: {VegetableName} x {Quantity} at {Price}", 
                        vegetable.Name, itemDto.Quantity, vegetable.Price);
                }

                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Order items saved successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save order items: {Message}", ex.Message);
                    throw new Exception($"Failed to save order items: {ex.Message}", ex);
                }

                await transaction.CommitAsync();
                _logger.LogInformation("Order {OrderId} completed successfully", order.Id);

                // Return the created order with items
                return new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    TotalAmount = order.TotalAmount,
                    ShippingAddress = order.ShippingAddress,
                    PaymentMethod = order.PaymentMethod,
                    Notes = order.Notes,
                    Items = orderItems.Select(oi => new OrderItemDetailDto
                    {
                        Id = oi.Id,
                        VegetableId = oi.VegetableId,
                        VegetableName = vegetables.First(v => v.Id == oi.VegetableId).Name,
                        VegetableImageUrl = vegetables.First(v => v.Id == oi.VegetableId).ImageUrl,
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Subtotal = oi.Subtotal
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order for user {UserId}: {Message}. Inner exception: {InnerException}", 
                    userId, ex.Message, ex.InnerException?.Message);
                
                try
                {
                    await transaction.RollbackAsync();
                    _logger.LogInformation("Transaction rolled back successfully");
                }
                catch (Exception rollbackEx)
                {
                    _logger.LogError(rollbackEx, "Failed to rollback transaction: {RollbackMessage}", rollbackEx.Message);
                }
                
                // Re-throw the original exception with more context
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByUserAsync(int userId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(oi => oi.Vegetable)
                    .Where(o => o.UserId == userId)
                    .Select(o => new OrderDto
                    {
                        Id = o.Id,
                        UserId = o.UserId,
                        OrderDate = o.OrderDate,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        ShippingAddress = o.ShippingAddress,
                        PaymentMethod = o.PaymentMethod,
                        Notes = o.Notes,
                        Items = o.Items.Select(oi => new OrderItemDetailDto
                        {
                            Id = oi.Id,
                            VegetableId = oi.VegetableId,
                            VegetableName = oi.Vegetable.Name,
                            VegetableImageUrl = oi.Vegetable.ImageUrl,
                            Quantity = oi.Quantity,
                            Price = oi.Price,
                            Subtotal = oi.Subtotal
                        }).ToList()
                    })
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user {UserId}: {Message}", userId, ex.Message);
                throw new Exception($"Failed to get orders: {ex.Message}", ex);
            }
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int id)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(oi => oi.Vegetable)
                    .Where(o => o.Id == id)
                    .Select(o => new OrderDto
                    {
                        Id = o.Id,
                        UserId = o.UserId,
                        OrderDate = o.OrderDate,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        ShippingAddress = o.ShippingAddress,
                        PaymentMethod = o.PaymentMethod,
                        Notes = o.Notes,
                        Items = o.Items.Select(oi => new OrderItemDetailDto
                        {
                            Id = oi.Id,
                            VegetableId = oi.VegetableId,
                            VegetableName = oi.Vegetable.Name,
                            VegetableImageUrl = oi.Vegetable.ImageUrl,
                            Quantity = oi.Quantity,
                            Price = oi.Price,
                            Subtotal = oi.Subtotal
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId}: {Message}", id, ex.Message);
                return null;
            }
        }

        public async Task<OrderDto> CancelOrderAsync(int orderId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                _logger.LogInformation("Starting order cancellation for order {OrderId}", orderId);

                var order = await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(oi => oi.Vegetable)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    throw new Exception($"Order with ID {orderId} not found");
                }

                // Check if order can be cancelled
                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
                {
                    throw new Exception($"Order cannot be cancelled. Current status: {order.Status}");
                }

                // Update order status
                order.Status = OrderStatus.Cancelled;

                // Restore stock for all items in the order
                foreach (var item in order.Items)
                {
                    var vegetable = item.Vegetable;
                    vegetable.StockQuantity += item.Quantity;
                    vegetable.InStock = true;

                    _logger.LogInformation("Restored stock for {VegetableName}: +{Quantity} (new total: {NewStock})", 
                        vegetable.Name, item.Quantity, vegetable.StockQuantity);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Order {OrderId} cancelled successfully", orderId);

                // Return the updated order
                return new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    TotalAmount = order.TotalAmount,
                    ShippingAddress = order.ShippingAddress,
                    PaymentMethod = order.PaymentMethod,
                    Notes = order.Notes,
                    Items = order.Items.Select(oi => new OrderItemDetailDto
                    {
                        Id = oi.Id,
                        VegetableId = oi.VegetableId,
                        VegetableName = oi.Vegetable.Name,
                        VegetableImageUrl = oi.Vegetable.ImageUrl,
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Subtotal = oi.Subtotal
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId}: {Message}", orderId, ex.Message);
                
                try
                {
                    await transaction.RollbackAsync();
                    _logger.LogInformation("Transaction rolled back successfully");
                }
                catch (Exception rollbackEx)
                {
                    _logger.LogError(rollbackEx, "Failed to rollback transaction: {RollbackMessage}", rollbackEx.Message);
                }
                
                throw;
            }
        }

        public async Task<bool> DeleteOrderAsync(int orderId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                _logger.LogInformation("Starting permanent deletion of order {OrderId}", orderId);

                var order = await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(oi => oi.Vegetable)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    throw new Exception($"Order with ID {orderId} not found");
                }

                // Check if order can be deleted (only Pending/Confirmed orders)
                if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
                {
                    throw new Exception($"Order cannot be deleted. Current status: {order.Status}. Only pending or confirmed orders can be deleted.");
                }

                // Restore stock for all items in the order before deletion
                foreach (var item in order.Items)
                {
                    var vegetable = item.Vegetable;
                    vegetable.StockQuantity += item.Quantity;
                    vegetable.InStock = true;

                    _logger.LogInformation("Restored stock for {VegetableName}: +{Quantity} (new total: {NewStock})", 
                        vegetable.Name, item.Quantity, vegetable.StockQuantity);
                }

                // Delete order items first (due to foreign key constraints)
                _context.OrderItems.RemoveRange(order.Items);
                
                // Delete the order
                _context.Orders.Remove(order);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Order {OrderId} permanently deleted successfully", orderId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting order {OrderId}: {Message}", orderId, ex.Message);
                
                try
                {
                    await transaction.RollbackAsync();
                    _logger.LogInformation("Transaction rolled back successfully");
                }
                catch (Exception rollbackEx)
                {
                    _logger.LogError(rollbackEx, "Failed to rollback transaction: {RollbackMessage}", rollbackEx.Message);
                }
                
                throw;
            }
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, OrderStatus status)
        {
            try
            {
                _logger.LogInformation("Updating order {OrderId} status to {Status}", orderId, status);

                var order = await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(oi => oi.Vegetable)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    throw new Exception($"Order with ID {orderId} not found");
                }

                order.Status = status;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} status updated successfully to {Status}", orderId, status);

                // Return the updated order
                return new OrderDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    TotalAmount = order.TotalAmount,
                    ShippingAddress = order.ShippingAddress,
                    PaymentMethod = order.PaymentMethod,
                    Notes = order.Notes,
                    Items = order.Items.Select(oi => new OrderItemDetailDto
                    {
                        Id = oi.Id,
                        VegetableId = oi.VegetableId,
                        VegetableName = oi.Vegetable.Name,
                        VegetableImageUrl = oi.Vegetable.ImageUrl,
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Subtotal = oi.Subtotal
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order {OrderId} status: {Message}", orderId, ex.Message);
                throw;
            }
        }
    }
}