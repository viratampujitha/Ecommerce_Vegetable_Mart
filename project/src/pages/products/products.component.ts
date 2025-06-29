import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Vegetable, Category } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="products-page fade-in">
      <div class="container">
        <div class="page-header">
          <h1>Our Fresh Vegetables</h1>
          <p>Discover our wide selection of fresh, organic vegetables</p>
        </div>

        <div class="filters-section">
          <div class="search-filters">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="Search vegetables..."
                class="form-control">
            </div>
            
            <div class="category-filter">
              <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="form-control">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <div class="sort-filter">
              <select [(ngModel)]="sortBy" (change)="onSortChange()" class="form-control">
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          <div class="filter-tags" *ngIf="hasActiveFilters()">
            <span class="filter-tag" *ngIf="searchQuery">
              Search: "{{ searchQuery }}"
              <button (click)="clearSearch()" class="clear-filter">×</button>
            </span>
            <span class="filter-tag" *ngIf="selectedCategory">
              Category: {{ getCategoryName(selectedCategory) }}
              <button (click)="clearCategory()" class="clear-filter">×</button>
            </span>
            <button (click)="clearAllFilters()" class="btn btn-outline btn-small">Clear All</button>
          </div>
        </div>

        <div class="products-section">
          <div class="results-info">
            <span>{{ filteredProducts.length }} products found</span>
          </div>
          
          <div *ngIf="loading" class="loading">
            <div class="spinner"></div>
          </div>
          
          <div *ngIf="!loading && filteredProducts.length === 0" class="no-results">
            <div class="no-results-content">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button (click)="clearAllFilters()" class="btn btn-primary">View All Products</button>
            </div>
          </div>
          
          <div *ngIf="!loading && filteredProducts.length > 0" class="products-grid grid grid-3">
            <app-product-card *ngFor="let product of filteredProducts" [product]="product"></app-product-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 40px 0;
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .page-header h1 {
      font-size: 36px;
      font-weight: bold;
      color: #2d5a3d;
      margin-bottom: 12px;
    }

    .page-header p {
      font-size: 18px;
      color: #666;
    }

    .filters-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 32px;
    }

    .search-filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .filter-tag {
      background: #e8f5e8;
      color: #2d5a3d;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .clear-filter {
      background: none;
      border: none;
      color: #2d5a3d;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
      min-width: auto;
    }

    .results-info {
      margin-bottom: 24px;
      color: #666;
      font-weight: 500;
    }

    .no-results {
      text-align: center;
      padding: 80px 0;
    }

    .no-results-content h3 {
      font-size: 24px;
      color: #333;
      margin-bottom: 12px;
    }

    .no-results-content p {
      color: #666;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .search-filters {
        grid-template-columns: 1fr;
      }
      
      .filter-tags {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Vegetable[] = [];
  filteredProducts: Vegetable[] = [];
  categories: Category[] = [];
  loading: boolean = true;
  
  searchQuery: string = '';
  selectedCategory: number | string = '';
  sortBy: string = 'name';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.handleQueryParams();
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = +params['category'];
      }
      this.applyFilters();
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService.getVegetables().subscribe(products => {
      this.products = products;
      this.applyFilters();
      this.loading = false;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === +this.selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    this.filteredProducts = filtered;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearCategory(): void {
    this.selectedCategory = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  getCategoryName(categoryId: number | string): string {
    const category = this.categories.find(c => c.id === +categoryId);
    return category ? category.name : '';
  }
}