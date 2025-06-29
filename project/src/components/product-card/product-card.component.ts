import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Vegetable } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-card card">
      <div class="product-image">
        <img [src]="product.imageUrl" [alt]="product.name" />
        <div class="product-badges">
          <span *ngIf="product.isOrganic" class="badge organic">Organic</span>
          <span *ngIf="!product.inStock" class="badge out-of-stock">Out of Stock</span>
        </div>
      </div>
      
      <div class="card-body">
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-description">{{ product.description }}</p>
        
        <div class="product-info">
          <span class="product-origin" *ngIf="product.origin">{{ product.origin }}</span>
          <span class="product-unit">per {{ product.unit }}</span>
        </div>
        
        <div class="product-footer">
          <div class="product-price">
            <span class="price">₹{{ product.price.toFixed(2) }}</span>
          </div>
          
          <div class="product-actions">
            <button 
              (click)="addToCart()" 
              [disabled]="!product.inStock"
              class="btn btn-primary">
              {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.organic {
      background-color: #28a745;
      color: white;
    }

    .badge.out-of-stock {
      background-color: #dc3545;
      color: white;
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .product-description {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 12px;
      flex: 1;
    }

    .product-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 12px;
      color: #666;
    }

    .product-origin {
      font-style: italic;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .price {
      font-size: 20px;
      font-weight: bold;
      color: #28a745;
    }

    .btn {
      white-space: nowrap;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Vegetable;

  constructor(private cartService: CartService) {}

  addToCart(): void {
    this.cartService.addToCart(this.product);
  }
}