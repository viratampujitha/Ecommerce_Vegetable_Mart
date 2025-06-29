import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Cart, Vegetable } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], totalItems: 0, totalPrice: 0 });
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        this.cartSubject.next(cart);
      } catch (error) {
        this.clearCart();
      }
    }
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  private calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return { totalItems, totalPrice };
  }

  addToCart(vegetable: Vegetable, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(item => item.vegetable.id === vegetable.id);

    let updatedItems: CartItem[];

    if (existingItem) {
      updatedItems = currentCart.items.map(item =>
        item.vegetable.id === vegetable.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        vegetable,
        quantity,
        price: vegetable.price
      };
      updatedItems = [...currentCart.items, newItem];
    }

    const totals = this.calculateTotals(updatedItems);
    const updatedCart: Cart = {
      items: updatedItems,
      ...totals
    };

    this.saveCart(updatedCart);
  }

  removeFromCart(vegetableId: number): void {
    const currentCart = this.cartSubject.value;
    const updatedItems = currentCart.items.filter(item => item.vegetable.id !== vegetableId);
    
    const totals = this.calculateTotals(updatedItems);
    const updatedCart: Cart = {
      items: updatedItems,
      ...totals
    };

    this.saveCart(updatedCart);
  }

  updateQuantity(vegetableId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(vegetableId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const updatedItems = currentCart.items.map(item =>
      item.vegetable.id === vegetableId
        ? { ...item, quantity }
        : item
    );

    const totals = this.calculateTotals(updatedItems);
    const updatedCart: Cart = {
      items: updatedItems,
      ...totals
    };

    this.saveCart(updatedCart);
  }

  clearCart(): void {
    const emptyCart: Cart = { items: [], totalItems: 0, totalPrice: 0 };
    this.saveCart(emptyCart);
  }

  getCart(): Cart {
    return this.cartSubject.value;
  }

  getCartItemCount(): number {
    return this.cartSubject.value.totalItems;
  }
}