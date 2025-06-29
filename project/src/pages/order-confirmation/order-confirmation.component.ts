import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmation-page fade-in">
      <div class="container">
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div *ngIf="!loading && !errorMessage && order" class="confirmation-content">
          <div class="success-header">
            <div class="success-icon">✅</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order. We'll start preparing your fresh vegetables right away!</p>
          </div>

          <div class="order-summary card">
            <div class="card-header">
              <h2>Order Summary</h2>
              <span class="order-number">Order #{{ order.id }}</span>
            </div>

            <div class="card-body">
              <div class="order-details">
                <div class="detail-section">
                  <h3>Order Information</h3>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="label">Order Date:</span>
                      <span class="value">{{ order.orderDate | date:'medium' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Status:</span>
                      <span class="value status-badge">{{ order.status }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Payment Method:</span>
                      <span class="value">{{ getPaymentMethodDisplay(order.paymentMethod) }}</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h3>Shipping Address</h3>
                  <p class="address">{{ order.shippingAddress }}</p>
                </div>

                <div *ngIf="order.notes" class="detail-section">
                  <h3>Order Notes</h3>
                  <p>{{ order.notes }}</p>
                </div>
              </div>

              <div class="order-items">
                <h3>Items Ordered</h3>
                <div class="items-list">
                  <div *ngFor="let item of order.items" class="order-item">
                    <div class="item-image">
                      <img [src]="item.vegetable?.imageUrl || item.vegetableImageUrl" [alt]="item.vegetable?.name || item.vegetableName" />
                    </div>
                    <div class="item-details">
                      <h4>{{ item.vegetable?.name || item.vegetableName }}</h4>
                      <p>{{ item.quantity }} {{ item.vegetable?.unit || 'units' }} × ₹{{ item.price.toFixed(2) }}</p>
                    </div>
                    <div class="item-total">
                      ₹{{ item.subtotal.toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-total">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>₹{{ getSubtotal().toFixed(2) }}</span>
                </div>
                <div class="total-row">
                  <span>Tax (GST):</span>
                  <span>₹{{ getTax().toFixed(2) }}</span>
                </div>
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div class="total-row final-total">
                  <span>Total:</span>
                  <span>₹{{ order.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="next-steps card">
            <div class="card-header">
              <h3>What happens next?</h3>
            </div>
            <div class="card-body">
              <div class="steps">
                <div class="step">
                  <div class="step-icon">📋</div>
                  <div class="step-content">
                    <h4>Order Processing</h4>
                    <p>We're preparing your order and will notify you when it's ready for shipment.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-icon">📦</div>
                  <div class="step-content">
                    <h4>Packaging</h4>
                    <p>Your fresh vegetables will be carefully packed to ensure quality during delivery.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-icon">🚚</div>
                  <div class="step-content">
                    <h4>Delivery</h4>
                    <p>Your order will be delivered to your address. You'll receive tracking information via email.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <a routerLink="/orders" class="btn btn-primary">View My Orders</a>
            <a routerLink="/products" class="btn btn-outline">Continue Shopping</a>
          </div>
        </div>

        <div *ngIf="!loading && !errorMessage && !order" class="error-message card">
          <div class="card-body">
            <h2>Order not found</h2>
            <p>We couldn't find the order you're looking for.</p>
            <a routerLink="/" class="btn btn-primary">Go to Home</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-page {
      padding: 40px 0;
      min-height: 100vh;
    }

    .success-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .success-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .success-header h1 {
      font-size: 36px;
      font-weight: bold;
      color: #28a745;
      margin-bottom: 12px;
    }

    .success-header p {
      font-size: 18px;
      color: #666;
    }

    .order-summary .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-summary .card-header h2 {
      margin: 0;
      color: #2d5a3d;
    }

    .order-number {
      background: #e8f5e8;
      color: #2d5a3d;
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 600;
      font-size: 14px;
    }

    .detail-section {
      margin-bottom: 32px;
    }

    .detail-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #2d5a3d;
      margin-bottom: 16px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .value {
      color: #333;
      font-weight: 500;
    }

    .status-badge {
      background: #fff3cd;
      color: #856404;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      text-transform: uppercase;
      width: fit-content;
    }

    .address {
      color: #333;
      line-height: 1.5;
      margin: 0;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .order-item {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
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

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 16px;
    }

    .item-details p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .item-total {
      font-weight: bold;
      color: #28a745;
      font-size: 16px;
    }

    .order-total {
      border-top: 2px solid #e9ecef;
      margin-top: 24px;
      padding-top: 24px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .total-row.final-total {
      border-top: 1px solid #e9ecef;
      margin-top: 12px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
      color: #28a745;
    }

    .next-steps {
      margin: 32px 0;
    }

    .next-steps .card-header h3 {
      margin: 0;
      color: #2d5a3d;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .step {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .step-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 16px;
    }

    .step-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }

    .error-message {
      text-align: center;
      padding: 40px;
    }

    @media (max-width: 768px) {
      .order-summary .card-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .order-item {
        flex-direction: column;
        text-align: center;
      }

      .action-buttons {
        flex-direction: column;
      }

      .steps {
        gap: 16px;
      }

      .step {
        text-align: left;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (orderId) {
      this.loadOrder(+orderId);
    } else {
      this.loading = false;
    }
  }

  private loadOrder(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load order:', error);
        this.errorMessage = error.message || 'Failed to load order details.';
        this.loading = false;
      }
    });
  }

  getPaymentMethodDisplay(method: string): string {
    const methods: { [key: string]: string } = {
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      'upi': 'UPI',
      'cash-on-delivery': 'Cash on Delivery'
    };
    return methods[method] || method;
  }

  getSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.18; // 18% GST
  }
}