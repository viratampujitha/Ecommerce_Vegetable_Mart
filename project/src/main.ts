import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="app">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>VeggieMart</h3>
              <p>Fresh vegetables delivered to your door. Quality you can trust, convenience you'll love.</p>
            </div>
            <div class="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/products">Products</a></li>
                <li><a href="/orders">My Orders</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="mailto:support@veggiemart.com">Contact Us</a></li>
                <li><a href="tel:+911234567891">+91 1234567891</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 VeggieMart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
    }

    .footer {
      background: #2d5a3d;
      color: white;
      padding: 40px 0 20px;
      margin-top: 80px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 40px;
      margin-bottom: 32px;
    }

    .footer-section h3,
    .footer-section h4 {
      margin-bottom: 16px;
      color: #e8f5e8;
    }

    .footer-section p {
      line-height: 1.6;
      color: #b8d4b8;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 8px;
    }

    .footer-section ul li a {
      color: #b8d4b8;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section ul li a:hover {
      color: #e8f5e8;
    }

    .footer-bottom {
      border-top: 1px solid #4a6b4a;
      padding-top: 20px;
      text-align: center;
    }

    .footer-bottom p {
      margin: 0;
      color: #b8d4b8;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  `]
})
export class App {}

const routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'order-confirmation', component: OrderConfirmationComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});