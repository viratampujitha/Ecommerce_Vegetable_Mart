import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Cart } from '../../models/product.model';
import { CreateOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-page fade-in">
      <div class="container">
        <div class="page-header">
          <h1>Checkout</h1>
        </div>

        <div *ngIf="!isAuthenticated" class="auth-required card">
          <div class="card-body">
            <h3>Login Required</h3>
            <p>Please log in to complete your order.</p>
            <a routerLink="/login" class="btn btn-primary">Go to Login</a>
          </div>
        </div>

        <div *ngIf="isAuthenticated && cart.items.length === 0" class="empty-cart card">
          <div class="card-body">
            <h3>Your cart is empty</h3>
            <p>Add some items to your cart before checking out.</p>
            <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>

        <div *ngIf="isAuthenticated && cart.items.length > 0" class="checkout-content">
          <div class="checkout-form">
            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
              <div class="form-section card">
                <div class="card-header">
                  <h3>Shipping Information</h3>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label class="form-label">Full Address *</label>
                    <textarea 
                      formControlName="shippingAddress" 
                      class="form-control"
                      [class.error]="checkoutForm.get('shippingAddress')?.invalid && checkoutForm.get('shippingAddress')?.touched"
                      rows="3"
                      placeholder="Enter your complete shipping address"></textarea>
                    <div *ngIf="checkoutForm.get('shippingAddress')?.invalid && checkoutForm.get('shippingAddress')?.touched" 
                         class="error-message">
                      Shipping address is required
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section card">
                <div class="card-header">
                  <h3>Payment Information</h3>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label class="form-label">Payment Method *</label>
                    <select 
                      formControlName="paymentMethod" 
                      class="form-control"
                      [class.error]="checkoutForm.get('paymentMethod')?.invalid && checkoutForm.get('paymentMethod')?.touched">
                      <option value="">Select payment method</option>
                      <option value="credit-card">Credit Card</option>
                      <option value="debit-card">Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="cash-on-delivery">Cash on Delivery</option>
                    </select>
                    <div *ngIf="checkoutForm.get('paymentMethod')?.invalid && checkoutForm.get('paymentMethod')?.touched" 
                         class="error-message">
                      Payment method is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Order Notes (Optional)</label>
                    <textarea 
                      formControlName="notes" 
                      class="form-control"
                      rows="3"
                      placeholder="Any special instructions for your order"></textarea>
                  </div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-error">
                {{ errorMessage }}
              </div>

              <div class="form-actions">
                <button type="submit" [disabled]="checkoutForm.invalid || isSubmitting" class="btn btn-primary btn-large">
                  {{ isSubmitting ? 'Processing...' : 'Place Order' }}
                </button>
                <a routerLink="/cart" class="btn btn-outline">Back to Cart</a>
              </div>
            </form>
          </div>

          <div class="order-summary">
            <div class="summary-card card">
              <div class="card-header">
                <h3>Order Summary</h3>
              </div>
              <div class="card-body">
                <div class="order-items">
                  <div *ngFor="let item of cart.items" class="order-item">
                    <div class="item-info">
                      <span class="item-name">{{ item.vegetable.name }}</span>
                      <span class="item-quantity">x{{ item.quantity }}</span>
                    </div>
                    <span class="item-price">₹{{ (item.quantity * item.price).toFixed(2) }}</span>
                  </div>
                </div>
                
                <div class="summary-totals">
                  <div class="summary-row">
                    <span>Subtotal ({{ cart.totalItems }} items)</span>
                    <span>₹{{ cart.totalPrice.toFixed(2) }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div class="summary-row">
                    <span>Tax</span>
                    <span>₹{{ getTaxAmount().toFixed(2) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total</span>
                    <span>₹{{ getTotalWithTax().toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 40px 0;
      min-height: 100vh;
    }

    .page-header h1 {
      font-size: 36px;
      font-weight: bold;
      color: #2d5a3d;
      margin-bottom: 32px;
    }

    .auth-required,
    .empty-cart {
      text-align: center;
      padding: 40px;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section .card-header h3 {
      margin: 0;
      color: #2d5a3d;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 32px;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 16px;
    }

    .summary-card {
      position: sticky;
      top: 100px;
    }

    .summary-card .card-header h3 {
      margin: 0;
      color: #2d5a3d;
    }

    .order-items {
      margin-bottom: 24px;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-name {
      font-weight: 500;
      color: #333;
    }

    .item-quantity {
      font-size: 14px;
      color: #666;
    }

    .item-price {
      font-weight: 600;
      color: #28a745;
    }

    .summary-totals {
      border-top: 2px solid #f0f0f0;
      padding-top: 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-row.total {
      border-top: 1px solid #f0f0f0;
      margin-top: 12px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
      color: #28a745;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .summary-card {
        position: static;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cart: Cart = { items: [], totalItems: 0, totalPrice: 0 };
  isAuthenticated: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    // Pre-fill shipping address if user has one
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.address) {
      const fullAddress = `${currentUser.address}, ${currentUser.city}, ${currentUser.state} ${currentUser.zipCode}`;
      this.checkoutForm.patchValue({
        shippingAddress: fullAddress
      });
    }
  }

  getTaxAmount(): number {
    return this.cart.totalPrice * 0.18; // 18% GST
  }

  getTotalWithTax(): number {
    return this.cart.totalPrice + this.getTaxAmount();
  }

  onSubmit(): void {
    if (this.checkoutForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const orderRequest: CreateOrderRequest = {
        shippingAddress: this.checkoutForm.value.shippingAddress,
        paymentMethod: this.checkoutForm.value.paymentMethod,
        notes: this.checkoutForm.value.notes
      };

      this.orderService.createOrder(orderRequest).subscribe({
        next: (order) => {
          this.router.navigate(['/order-confirmation'], { 
            queryParams: { orderId: order.id } 
          });
        },
        error: (error) => {
          console.error('Order creation failed:', error);
          this.errorMessage = error.message || 'Failed to create order. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }
}