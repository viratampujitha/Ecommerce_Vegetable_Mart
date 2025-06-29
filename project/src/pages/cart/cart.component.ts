import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-page fade-in">
      <div class="container">
        <div class="page-header">
          <h1>Shopping Cart</h1>
        </div>

        <div *ngIf="cart.items.length === 0" class="empty-cart">
          <div class="empty-cart-content">
            <div class="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some fresh vegetables to get started!</p>
            <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>

        <div *ngIf="cart.items.length > 0" class="cart-content">
          <div class="cart-items">
            <div *ngFor="let item of cart.items" class="cart-item card">
              <div class="item-image">
                <img [src]="item.vegetable.imageUrl" [alt]="item.vegetable.name" />
              </div>
              
              <div class="item-details">
                <h3 class="item-name">{{ item.vegetable.name }}</h3>
                <p class="item-description">{{ item.vegetable.description }}</p>
                <div class="item-info">
                  <span class="item-price">₹{{ item.price.toFixed(2) }} per {{ item.vegetable.unit }}</span>
                  <span *ngIf="item.vegetable.isOrganic" class="organic-badge">Organic</span>
                </div>
              </div>
              
              <div class="item-quantity">
                <label class="quantity-label">Quantity:</label>
                <div class="quantity-controls">
                  <button (click)="decreaseQuantity(item)" class="quantity-btn">-</button>
                  <span class="quantity-value">{{ item.quantity }}</span>
                  <button (click)="increaseQuantity(item)" class="quantity-btn">+</button>
                </div>
              </div>
              
              <div class="item-total">
                <div class="item-subtotal">₹{{ (item.quantity * item.price).toFixed(2) }}</div>
                <button (click)="removeItem(item)" class="btn btn-danger btn-small">Remove</button>
              </div>
            </div>
          </div>

          <div class="cart-summary card">
            <div class="card-header">
              <h2>Order Summary</h2>
            </div>
            <div class="card-body">
              <div class="summary-row">
                <span>Items ({{ cart.totalItems }})</span>
                <span>₹{{ cart.totalPrice.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>₹{{ cart.totalPrice.toFixed(2) }}</span>
              </div>
            </div>
            <div class="card-footer">
              <a routerLink="/checkout" class="btn btn-primary btn-full">Proceed to Checkout</a>
              <a routerLink="/products" class="btn btn-outline btn-full">Continue Shopping</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding: 40px 0;
      min-height: 100vh;
    }

    .page-header h1 {
      font-size: 36px;
      font-weight: bold;
      color: #2d5a3d;
      margin-bottom: 32px;
    }

    .empty-cart {
      text-align: center;
      padding: 80px 0;
    }

    .empty-cart-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .empty-cart-content h2 {
      font-size: 28px;
      color: #333;
      margin-bottom: 12px;
    }

    .empty-cart-content p {
      color: #666;
      margin-bottom: 32px;
      font-size: 16px;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 120px 1fr auto auto;
      gap: 20px;
      align-items: center;
      padding: 20px;
    }

    .item-image {
      width: 120px;
      height: 120px;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .item-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .item-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .item-price {
      font-weight: 500;
      color: #28a745;
    }

    .organic-badge {
      background: #28a745;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .item-quantity {
      text-align: center;
    }

    .quantity-label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .quantity-btn:hover {
      background: #f8f9fa;
    }

    .quantity-value {
      font-weight: 600;
      min-width: 24px;
      text-align: center;
    }

    .item-total {
      text-align: right;
    }

    .item-subtotal {
      font-size: 18px;
      font-weight: bold;
      color: #28a745;
      margin-bottom: 12px;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
      min-width: auto;
    }

    .cart-summary {
      align-self: start;
      position: sticky;
      top: 100px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 8px 0;
    }

    .summary-row.total {
      border-top: 2px solid #e9ecef;
      margin-top: 16px;
      padding-top: 16px;
      font-size: 18px;
      font-weight: bold;
      color: #28a745;
    }

    .btn-full {
      width: 100%;
      margin-bottom: 12px;
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 12px;
      }

      .item-quantity,
      .item-total {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
      }

      .cart-summary {
        position: static;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart = { items: [], totalItems: 0, totalPrice: 0 };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.vegetable.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.vegetable.id, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.vegetable.id);
  }
}