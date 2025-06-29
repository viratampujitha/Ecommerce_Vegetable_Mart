import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Vegetable, Category } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="home-page fade-in">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Fresh Vegetables Delivered to Your Door</h1>
            <p class="hero-description">
              Discover the freshest, highest quality vegetables sourced directly from local farms. 
              Organic, nutritious, and delivered with care.
            </p>
            <div class="hero-actions">
              <a routerLink="/products" class="btn btn-primary btn-large">Shop Now</a>
            </div>
          </div>
          <div class="hero-image">
            <img src="https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg" alt="Fresh Vegetables" />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <h2 class="section-title">Why Choose VeggieMart?</h2>
          <div class="features-grid grid grid-3">
            <div class="feature-card card">
              <div class="feature-icon">🌱</div>
              <h3>Fresh & Organic</h3>
              <p>All our vegetables are sourced from certified organic farms, ensuring the highest quality and nutritional value.</p>
            </div>
            <div class="feature-card card">
              <div class="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Same-day delivery available in most areas. Your fresh vegetables delivered right to your doorstep.</p>
            </div>
            <div class="feature-card card">
              <div class="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive prices with no hidden fees. Quality vegetables at prices that won't break the bank.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories">
        <div class="container">
          <h2 class="section-title">Shop by Category</h2>
          <div class="categories-grid grid grid-4" *ngIf="categories.length > 0">
            <div *ngFor="let category of categories" class="category-card card">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
              <a [routerLink]="['/products']" [queryParams]="{category: category.id}" class="btn btn-outline">
                Browse {{ category.name }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-products">
        <div class="container">
          <h2 class="section-title">Featured Products</h2>
          <div class="products-grid grid grid-3" *ngIf="featuredProducts.length > 0">
            <app-product-card *ngFor="let product of featuredProducts" [product]="product"></app-product-card>
          </div>
          <div class="text-center" style="margin-top: 32px;">
            <a routerLink="/products" class="btn btn-primary">View All Products</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
      padding: 80px 0;
    }

    .hero .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
    }

    .hero-title {
      font-size: 48px;
      font-weight: bold;
      color: #2d5a3d;
      margin-bottom: 24px;
      line-height: 1.2;
    }

    .hero-description {
      font-size: 18px;
      color: #5a6c57;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 16px;
    }

    .hero-image img {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 36px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 48px;
      color: #2d5a3d;
    }

    .features {
      padding: 80px 0;
      background: white;
    }

    .feature-card {
      text-align: center;
      padding: 32px 24px;
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #2d5a3d;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
    }

    .categories {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .category-card {
      text-align: center;
      padding: 32px 24px;
    }

    .category-card h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #2d5a3d;
    }

    .category-card p {
      color: #666;
      margin-bottom: 20px;
    }

    .featured-products {
      padding: 80px 0;
      background: white;
    }

    .text-center {
      text-align: center;
    }

    @media (max-width: 768px) {
      .hero .container {
        grid-template-columns: 1fr;
        gap: 32px;
        text-align: center;
      }

      .hero-title {
        font-size: 32px;
      }

      .section-title {
        font-size: 28px;
      }

      .features,
      .categories,
      .featured-products {
        padding: 48px 0;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Vegetable[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  private loadFeaturedProducts(): void {
    this.productService.getVegetables().subscribe(vegetables => {
      this.featuredProducts = vegetables.slice(0, 6);
    });
  }
}