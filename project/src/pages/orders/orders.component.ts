import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-page fade-in">
      <div class="container">
        <div class="page-header">
          <h1>My Orders</h1>
          <p>Track and manage your vegetable orders</p>
        </div>

        <div *ngIf="!isAuthenticated" class="auth-required card">
          <div class="card-body">
            <h3>Login Required</h3>
            <p>Please log in to view your orders.</p>
            <a routerLink="/login" class="btn btn-primary">Go to Login</a>
          </div>
        </div>

        <div *ngIf="isAuthenticated">
          <div *ngIf="loading" class="loading">
            <div class="spinner"></div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
            <button (click)="clearError()" class="btn btn-outline btn-small" style="margin-left: 10px;">Dismiss</button>
          </div>

          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
            <button (click)="clearSuccess()" class="btn btn-outline btn-small" style="margin-left: 10px;">Dismiss</button>
          </div>

          <div *ngIf="!loading && !errorMessage && orders.length === 0" class="no-orders">
            <div class="no-orders-content">
              <div class="no-orders-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Start shopping for fresh vegetables!</p>
              <a routerLink="/products" class="btn btn-primary">Browse Products</a>
            </div>
          </div>

          <div *ngIf="!loading && orders.length > 0" class="orders-list">
            <div *ngFor="let order of orders; trackBy: trackByOrderId" class="order-card card">
              <div class="card-header">
                <div class="order-header-info">
                  <h3>Order #{{ order.id }}</h3>
                  <span class="order-date">{{ order.orderDate | date:'medium' }}</span>
                </div>
                <div class="order-status">
                  <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <div class="card-body">
                <div class="order-items" *ngIf="order.items && order.items.length > 0">
                  <div *ngFor="let item of order.items" class="order-item">
                    <div class="item-image">
                      <img [src]="getItemImageUrl(item)" [alt]="getItemName(item)" />
                    </div>
                    <div class="item-details">
                      <h4>{{ getItemName(item) }}</h4>
                      <p>Quantity: {{ item.quantity }} {{ getItemUnit(item) }}</p>
                      <p class="item-price">₹{{ item.subtotal.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="!order.items || order.items.length === 0" class="no-items">
                  <p>No items found for this order</p>
                </div>

                <div class="order-details">
                  <div class="detail-row">
                    <span>Shipping Address:</span>
                    <span>{{ order.shippingAddress || 'Not provided' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Payment Method:</span>
                    <span>{{ getPaymentMethodDisplay(order.paymentMethod) || 'Not specified' }}</span>
                  </div>
                  <div *ngIf="order.notes" class="detail-row">
                    <span>Notes:</span>
                    <span>{{ order.notes }}</span>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="order-total">
                  <strong>Total: ₹{{ order.totalAmount.toFixed(2) }}</strong>
                </div>
                <div class="order-actions">
                  <button 
                    *ngIf="canDeleteOrder(order)" 
                    (click)="deleteOrder(order)" 
                    [disabled]="isProcessingDelete"
                    class="btn btn-danger btn-small">
                    {{ isProcessingDelete ? 'Deleting...' : 'Delete Order' }}
                  </button>
                  <button *ngIf="canReorder(order)" (click)="reorder(order)" class="btn btn-outline btn-small">
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      padding: 40px 0;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      font-size: 36px;
      font-weight: bold;
      color: #2d5a3d;
      margin-bottom: 8px;
    }

    .page-header p {
      color: #666;
      font-size: 16px;
    }

    .auth-required {
      text-align: center;
      padding: 40px;
    }

    .no-orders {
      text-align: center;
      padding: 80px 0;
    }

    .no-orders-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .no-orders-content h2 {
      font-size: 28px;
      color: #333;
      margin-bottom: 12px;
    }

    .no-orders-content p {
      color: #666;
      margin-bottom: 32px;
      font-size: 16px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .order-card .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .order-header-info h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 18px;
    }

    .order-date {
      color: #666;
      font-size: 14px;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.confirmed {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.processing {
      background: #cce7ff;
      color: #0056b3;
    }

    .status-badge.shipped {
      background: #e2e3e5;
      color: #383d41;
    }

    .status-badge.delivered {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .order-items {
      margin-bottom: 20px;
    }

    .order-item {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .item-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .item-details p {
      margin: 0 0 2px 0;
      font-size: 14px;
      color: #666;
    }

    .item-price {
      color: #28a745 !important;
      font-weight: 600 !important;
    }

    .no-items {
      padding: 20px;
      text-align: center;
      color: #666;
      font-style: italic;
    }

    .order-details {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-row span:first-child {
      color: #666;
      font-weight: 500;
    }

    .detail-row span:last-child {
      color: #333;
      text-align: right;
      max-width: 60%;
      word-wrap: break-word;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-total {
      font-size: 18px;
      color: #28a745;
    }

    .order-actions {
      display: flex;
      gap: 8px;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
      min-width: auto;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (max-width: 768px) {
      .order-card .card-header {
        flex-direction: column;
        gap: 12px;
      }

      .card-footer {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .order-actions {
        justify-content: center;
      }

      .detail-row {
        flex-direction: column;
        gap: 4px;
      }

      .detail-row span:last-child {
        max-width: 100%;
        text-align: left;
      }

      .alert {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading: boolean = true;
  isAuthenticated: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isProcessingDelete: boolean = false;
  
  private ordersSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.loadOrders();
      this.subscribeToOrderUpdates();
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  private subscribeToOrderUpdates(): void {
    this.ordersSubscription = this.orderService.orders$.subscribe(orders => {
      console.log('Orders updated via subscription:', orders);
      this.orders = orders.sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
    });
  }

  private loadOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      console.log('Loading orders for user:', currentUser.id);
      this.orderService.getOrdersByUser(currentUser.id).subscribe({
        next: (orders) => {
          console.log('Orders received:', orders);
          this.orders = orders.sort((a, b) => 
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
          this.loading = false;
          
          // Clear any previous error messages when orders load successfully
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Failed to load orders:', error);
          this.errorMessage = error.message || 'Failed to load orders. Please try again.';
          this.loading = false;
        }
      });
    } else {
      console.error('No current user found');
      this.errorMessage = 'Please log in to view your orders.';
      this.loading = false;
    }
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id || index;
  }

  getItemImageUrl(item: any): string {
    const imageUrl = item.vegetable?.imageUrl || item.vegetableImageUrl || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg';
    return imageUrl;
  }

  getItemName(item: any): string {
    const name = item.vegetable?.name || item.vegetableName || 'Unknown Item';
    return name;
  }

  getItemUnit(item: any): string {
    return item.vegetable?.unit || 'units';
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getPaymentMethodDisplay(method: string): string {
    if (!method) return 'Not specified';
    
    const methods: { [key: string]: string } = {
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      'upi': 'UPI',
      'cash-on-delivery': 'Cash on Delivery'
    };
    return methods[method] || method;
  }

  canDeleteOrder(order: Order): boolean {
    return order.status === OrderStatus.Pending || order.status === OrderStatus.Confirmed;
  }

  canReorder(order: Order): boolean {
    return order.status === OrderStatus.Delivered || order.status === OrderStatus.Cancelled;
  }

  deleteOrder(order: Order): void {
    if (confirm(`Are you sure you want to permanently delete Order #${order.id}? This action cannot be undone.`)) {
      this.isProcessingDelete = true;
      this.errorMessage = '';
      this.successMessage = '';

      console.log('Attempting to delete order permanently:', order.id);

      this.orderService.deleteOrder(order.id!).subscribe({
        next: (success) => {
          console.log('Order deleted successfully:', success);
          
          this.successMessage = `Order #${order.id} has been permanently deleted.`;
          this.isProcessingDelete = false;
          
          // The order list will be automatically updated via the subscription
        },
        error: (error) => {
          console.error('Failed to delete order:', error);
          
          // Check if the order exists in our current orders list
          const orderExists = this.orders.some(o => o.id === order.id);
          
          if (!orderExists) {
            this.errorMessage = `Order #${order.id} not found. Please refresh the page.`;
          } else if (error.message.includes('not found')) {
            this.errorMessage = `Order #${order.id} could not be found on the server.`;
          } else {
            this.errorMessage = error.message || 'Failed to delete order. Please try again.';
          }
          
          this.isProcessingDelete = false;
        }
      });
    }
  }

  reorder(order: Order): void {
    if (confirm(`Add all items from Order #${order.id} to your cart?`)) {
      let itemsAdded = 0;
      
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          // Create a mock vegetable object for the cart
          const vegetable = {
            id: item.vegetableId,
            name: item.vegetableName || 'Unknown Item',
            description: '',
            price: item.price,
            imageUrl: item.vegetableImageUrl || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg',
            categoryId: 1,
            inStock: true,
            stockQuantity: 100,
            unit: 'units',
            isOrganic: false
          };
          
          this.cartService.addToCart(vegetable, item.quantity);
          itemsAdded++;
        });
        
        this.successMessage = `${itemsAdded} items from Order #${order.id} have been added to your cart.`;
      } else {
        this.errorMessage = `No items found in Order #${order.id} to reorder.`;
      }
    }
  }

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }
}