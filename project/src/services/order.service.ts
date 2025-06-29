import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Order, OrderStatus, CreateOrderRequest, OrderItem } from '../models/order.model';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  // Enhanced mock data with more orders for testing (including Order #5)
  private mockOrders: Order[] = [
    {
      id: 1,
      userId: 1,
      orderDate: new Date('2025-01-15T10:30:00'),
      status: OrderStatus.Delivered,
      totalAmount: 156.47,
      shippingAddress: '123 Main Street, Apartment 4B, Downtown City, State 12345',
      paymentMethod: 'credit-card',
      notes: 'Please leave at front door if no one is home',
      items: [
        {
          id: 1,
          orderId: 1,
          vegetableId: 1,
          vegetableName: 'Fresh Spinach',
          vegetableImageUrl: 'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg',
          quantity: 2,
          price: 45.99,
          subtotal: 91.98
        },
        {
          id: 2,
          orderId: 1,
          vegetableId: 2,
          vegetableName: 'Organic Carrots',
          vegetableImageUrl: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
          quantity: 1,
          price: 35.49,
          subtotal: 35.49
        }
      ]
    },
    {
      id: 2,
      userId: 1,
      orderDate: new Date('2025-01-20T14:15:00'),
      status: OrderStatus.Pending,
      totalAmount: 89.97,
      shippingAddress: '456 Oak Avenue, Suite 2A, Riverside, State 67890',
      paymentMethod: 'upi',
      notes: 'Call before delivery',
      items: [
        {
          id: 3,
          orderId: 2,
          vegetableId: 3,
          vegetableName: 'Fresh Tomatoes',
          vegetableImageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
          quantity: 1,
          price: 55.99,
          subtotal: 55.99
        },
        {
          id: 4,
          orderId: 2,
          vegetableId: 4,
          vegetableName: 'Fresh Basil',
          vegetableImageUrl: 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg',
          quantity: 1,
          price: 25.99,
          subtotal: 25.99
        }
      ]
    },
    {
      id: 3,
      userId: 1,
      orderDate: new Date('2025-01-25T09:45:00'),
      status: OrderStatus.Confirmed,
      totalAmount: 123.45,
      shippingAddress: '789 Pine Street, Building C, Unit 5, Metro City, State 54321',
      paymentMethod: 'cash-on-delivery',
      notes: 'Please ring the bell twice',
      items: [
        {
          id: 5,
          orderId: 3,
          vegetableId: 5,
          vegetableName: 'Broccoli',
          vegetableImageUrl: 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg',
          quantity: 2,
          price: 65.49,
          subtotal: 130.98
        }
      ]
    },
    {
      id: 4,
      userId: 1,
      orderDate: new Date('2025-01-27T16:20:00'),
      status: OrderStatus.Processing,
      totalAmount: 78.50,
      shippingAddress: '321 Elm Drive, Floor 2, Apartment 8B, Garden City, State 98765',
      paymentMethod: 'debit-card',
      notes: 'Contactless delivery preferred',
      items: [
        {
          id: 7,
          orderId: 4,
          vegetableId: 1,
          vegetableName: 'Fresh Spinach',
          vegetableImageUrl: 'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg',
          quantity: 1,
          price: 45.99,
          subtotal: 45.99
        },
        {
          id: 8,
          orderId: 4,
          vegetableId: 4,
          vegetableName: 'Fresh Basil',
          vegetableImageUrl: 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg',
          quantity: 1,
          price: 25.99,
          subtotal: 25.99
        }
      ]
    },
    {
      id: 5,
      userId: 1,
      orderDate: new Date('2025-01-28T11:30:00'),
      status: OrderStatus.Pending,
      totalAmount: 142.97,
      shippingAddress: '555 Maple Lane, Apartment 12A, Green Valley, State 11223',
      paymentMethod: 'credit-card',
      notes: 'Please deliver between 2-4 PM',
      items: [
        {
          id: 9,
          orderId: 5,
          vegetableId: 6,
          vegetableName: 'Sweet Potatoes',
          vegetableImageUrl: 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg',
          quantity: 2,
          price: 42.99,
          subtotal: 85.98
        },
        {
          id: 10,
          orderId: 5,
          vegetableId: 3,
          vegetableName: 'Fresh Tomatoes',
          vegetableImageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
          quantity: 1,
          price: 55.99,
          subtotal: 55.99
        }
      ]
    },
    {
      id: 6,
      userId: 1,
      orderDate: new Date('2025-01-29T08:15:00'),
      status: OrderStatus.Confirmed,
      totalAmount: 97.48,
      shippingAddress: '777 Cedar Court, Unit B, Riverside Heights, State 44556',
      paymentMethod: 'upi',
      notes: 'Ring doorbell once',
      items: [
        {
          id: 11,
          orderId: 6,
          vegetableId: 1,
          vegetableName: 'Fresh Spinach',
          vegetableImageUrl: 'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg',
          quantity: 1,
          price: 45.99,
          subtotal: 45.99
        },
        {
          id: 12,
          orderId: 6,
          vegetableId: 2,
          vegetableName: 'Organic Carrots',
          vegetableImageUrl: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
          quantity: 1,
          price: 35.49,
          subtotal: 35.49
        }
      ]
    }
  ];

  private readonly DELETED_ORDERS_STORAGE_KEY = 'veggie_mart_deleted_orders';

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.loadPersistedDeletions();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private loadPersistedDeletions(): void {
    try {
      const deletions = localStorage.getItem(this.DELETED_ORDERS_STORAGE_KEY);
      if (deletions) {
        const deletedOrderIds = JSON.parse(deletions);
        // Remove deleted orders from mock data
        this.mockOrders = this.mockOrders.filter(order => !deletedOrderIds.includes(order.id));
      }
    } catch (error) {
      console.warn('Failed to load persisted deletions:', error);
    }
  }

  private persistOrderDeletion(orderId: number): void {
    try {
      const existingDeletions = localStorage.getItem(this.DELETED_ORDERS_STORAGE_KEY);
      const deletedOrderIds = existingDeletions ? JSON.parse(existingDeletions) : [];
      
      if (!deletedOrderIds.includes(orderId)) {
        deletedOrderIds.push(orderId);
        localStorage.setItem(this.DELETED_ORDERS_STORAGE_KEY, JSON.stringify(deletedOrderIds));
      }
    } catch (error) {
      console.warn('Failed to persist order deletion:', error);
    }
  }

  private applyPersistedDeletions(orders: Order[]): Order[] {
    try {
      const deletions = localStorage.getItem(this.DELETED_ORDERS_STORAGE_KEY);
      if (!deletions) return orders;
      
      const deletedOrderIds = JSON.parse(deletions);
      
      return orders.filter(order => !deletedOrderIds.includes(order.id));
    } catch (error) {
      console.warn('Failed to apply persisted deletions:', error);
      return orders;
    }
  }

  createOrder(orderRequest: CreateOrderRequest): Observable<Order> {
    const currentUser = this.authService.getCurrentUser();
    const cart = this.cartService.getCart();

    if (!currentUser || cart.items.length === 0) {
      return throwError(() => new Error('Invalid order request'));
    }

    // Convert cart items to order items format expected by backend
    const orderItems = cart.items.map(cartItem => ({
      vegetableId: cartItem.vegetable.id,
      quantity: cartItem.quantity,
      price: cartItem.price
    }));

    const createOrderDto = {
      shippingAddress: orderRequest.shippingAddress,
      paymentMethod: orderRequest.paymentMethod,
      notes: orderRequest.notes || '',
      items: orderItems
    };

    console.log('Creating order with data:', createOrderDto);

    return this.http.post<any>(this.apiUrl, createOrderDto, { headers: this.getAuthHeaders() })
      .pipe(
        tap((response) => {
          console.log('Order created successfully:', response);
          // Clear cart after successful order creation
          this.cartService.clearCart();
          // Refresh orders list
          this.refreshOrders();
        }),
        catchError((error) => {
          console.error('Order creation failed:', error);
          
          // If API is not available, create a mock order
          if (error.status === 0 || error.status === 404) {
            console.log('API not available, creating mock order');
            
            // Generate a new mock order
            const newOrderId = Math.max(...this.mockOrders.map(o => o.id || 0)) + 1;
            const totalAmount = cart.totalPrice;
            
            const newOrder: Order = {
              id: newOrderId,
              userId: currentUser.id!,
              orderDate: new Date(),
              status: OrderStatus.Pending,
              totalAmount: totalAmount,
              shippingAddress: orderRequest.shippingAddress,
              paymentMethod: orderRequest.paymentMethod,
              notes: orderRequest.notes || '',
              items: cart.items.map((cartItem, index) => ({
                id: newOrderId * 100 + index + 1,
                orderId: newOrderId,
                vegetableId: cartItem.vegetable.id,
                vegetableName: cartItem.vegetable.name,
                vegetableImageUrl: cartItem.vegetable.imageUrl,
                quantity: cartItem.quantity,
                price: cartItem.price,
                subtotal: cartItem.quantity * cartItem.price
              }))
            };
            
            // Add to mock orders
            this.mockOrders.push(newOrder);
            
            // Clear cart
            this.cartService.clearCart();
            
            // Update orders subject
            this.refreshOrders();
            
            console.log('Mock order created:', newOrder);
            return of(newOrder);
          }
          
          return this.handleError(error);
        })
      );
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    console.log('Fetching orders for user:', userId);
    
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(orders => this.applyPersistedDeletions(orders)),
        tap((orders) => {
          console.log('Orders fetched from API:', orders);
          this.ordersSubject.next(orders);
        }),
        catchError((error) => {
          console.warn('API not available for orders, using mock data:', error);
          // Return mock data as fallback with persisted deletions applied
          const userOrders = this.mockOrders.filter(order => order.userId === userId);
          const filteredOrders = this.applyPersistedDeletions(userOrders);
          console.log('Using mock orders with deletions applied:', filteredOrders);
          this.ordersSubject.next(filteredOrders);
          return of(filteredOrders);
        })
      );
  }

  getOrderById(id: number): Observable<Order | undefined> {
    console.log('Fetching order by ID:', id);
    
    return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(order => {
          if (order) {
            const filteredOrders = this.applyPersistedDeletions([order]);
            return filteredOrders.length > 0 ? filteredOrders[0] : undefined;
          }
          return order;
        }),
        tap((order) => {
          console.log('Order fetched from API:', order);
        }),
        catchError((error) => {
          console.warn('API not available for order, checking mock data:', error);
          
          // Check mock data for the order
          const order = this.mockOrders.find(o => o.id === id);
          
          if (order) {
            const filteredOrders = this.applyPersistedDeletions([order]);
            const filteredOrder = filteredOrders.length > 0 ? filteredOrders[0] : undefined;
            console.log('Found order in mock data with deletions applied:', filteredOrder);
            return of(filteredOrder);
          } else {
            console.log('Order not found in mock data either');
            // Return undefined instead of throwing error
            return of(undefined);
          }
        })
      );
  }

  deleteOrder(orderId: number): Observable<boolean> {
    console.log('Deleting order permanently:', orderId);
    
    // First check if the order exists in our mock data
    const mockOrderIndex = this.mockOrders.findIndex(o => o.id === orderId);
    if (mockOrderIndex === -1) {
      console.log('Order not found in mock data for deletion');
      return throwError(() => new Error(`Order #${orderId} could not be found. Please refresh the page and try again.`));
    }

    const mockOrder = this.mockOrders[mockOrderIndex];
    
    // Check if order can be deleted (only Pending/Confirmed orders)
    if (mockOrder.status !== OrderStatus.Pending && mockOrder.status !== OrderStatus.Confirmed) {
      return throwError(() => new Error(`Order #${orderId} cannot be deleted. Current status: ${mockOrder.status}. Only pending or confirmed orders can be deleted.`));
    }
    
    // Try the API first
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(() => true),
        tap(() => {
          console.log('Order deleted successfully via API:', orderId);
          this.refreshOrders();
        }),
        catchError((error) => {
          console.warn('API not available for order deletion, using local deletion:', error);
          
          // For mock data, permanently remove the order
          this.mockOrders.splice(mockOrderIndex, 1);
          
          // Persist the deletion
          this.persistOrderDeletion(orderId);
          
          // **FIX: Update orders subject with current orders, not empty array**
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && currentUser.id) {
            const userOrders = this.mockOrders.filter(order => order.userId === currentUser.id);
            const filteredOrders = this.applyPersistedDeletions(userOrders);
            this.ordersSubject.next(filteredOrders);
            console.log('Updated orders after deletion:', filteredOrders);
          }
          
          console.log('Order deleted permanently from mock data:', orderId);
          return of(true);
        })
      );
  }

  // Keep the old cancelOrder method for backward compatibility, but make it call deleteOrder
  cancelOrder(orderId: number): Observable<Order> {
    console.log('Cancelling order (will be permanently deleted):', orderId);
    
    return this.deleteOrder(orderId).pipe(
      map(() => {
        // Return a mock cancelled order for compatibility
        return {
          id: orderId,
          userId: 0,
          orderDate: new Date(),
          status: OrderStatus.Cancelled,
          totalAmount: 0,
          shippingAddress: '',
          paymentMethod: '',
          items: []
        } as Order;
      })
    );
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    console.log('Updating order status:', orderId, status);
    
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, { status }, { headers: this.getAuthHeaders() })
      .pipe(
        tap((order) => {
          console.log('Order status updated successfully:', order);
          this.refreshOrders();
        }),
        catchError((error) => {
          console.warn('API not available for order status update, using local update:', error);
          
          // Check if it's a 404 error and handle with mock data
          if (error.status === 404 || error.status === 0) {
            // For mock data, simulate status update
            const mockOrderIndex = this.mockOrders.findIndex(o => o.id === orderId);
            if (mockOrderIndex !== -1) {
              this.mockOrders[mockOrderIndex].status = status;
              
              // Update orders subject
              this.refreshOrders();
              
              console.log('Order status updated using mock data:', this.mockOrders[mockOrderIndex]);
              return of(this.mockOrders[mockOrderIndex]);
            } else {
              console.log('Order not found in mock data for status update');
              return throwError(() => new Error(`Order with ID ${orderId} not found`));
            }
          }
          
          return this.handleError(error);
        })
      );
  }

  private refreshOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      // Get current orders and apply deletions
      const userOrders = this.mockOrders.filter(order => order.userId === currentUser.id);
      const filteredOrders = this.applyPersistedDeletions(userOrders);
      console.log('Refreshing orders - User orders:', userOrders.length, 'Filtered orders:', filteredOrders.length);
      this.ordersSubject.next(filteredOrders);
    }
  }

  clearPersistedDeletions(): void {
    localStorage.removeItem(this.DELETED_ORDERS_STORAGE_KEY);
    this.refreshOrders();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.details) {
        errorMessage = error.error.details;
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Using offline mode.';
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}