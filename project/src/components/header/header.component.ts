import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a routerLink="/" class="logo-link">
              🥬 VeggieMart
            </a>
          </div>
          
          <nav class="nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
            <a routerLink="/products" routerLinkActive="active">Products</a>
            <a *ngIf="currentUser" routerLink="/orders" routerLinkActive="active">Orders</a>
          </nav>

          <div class="header-actions">
            <a routerLink="/cart" class="cart-link">
              🛒 Cart <span class="cart-count" *ngIf="cartItemCount > 0">({{ cartItemCount }})</span>
            </a>
            
            <div *ngIf="currentUser; else loginTemplate" class="user-menu">
              <span class="user-name">Hi, {{ currentUser.firstName }}!</span>
              <button (click)="logout()" class="btn btn-outline">Logout</button>
            </div>
            
            <ng-template #loginTemplate>
              <div class="auth-links">
                <a routerLink="/login" class="btn btn-outline">Login</a>
                <a routerLink="/register" class="btn btn-primary">Register</a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      gap: 24px;
    }

    .logo-link {
      font-size: 24px;
      font-weight: bold;
      color: #28a745;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav {
      display: flex;
      gap: 32px;
      flex: 1;
      justify-content: center;
    }

    .nav a {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .nav a:hover,
    .nav a.active {
      color: #28a745;
      border-bottom-color: #28a745;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cart-link {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      position: relative;
    }

    .cart-count {
      color: #28a745;
      font-weight: bold;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-name {
      color: #333;
      font-weight: 500;
    }

    .auth-links {
      display: flex;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }

      .nav {
        justify-content: center;
        gap: 24px;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
      }

      .auth-links {
        flex-direction: column;
        width: 100%;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  cartItemCount: number = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}