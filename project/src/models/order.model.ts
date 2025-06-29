import { User } from './user.model';
import { Vegetable } from './product.model';

export interface OrderItem {
  id?: number;
  orderId?: number;
  vegetableId: number;
  vegetable?: Vegetable;
  // Backend API format (for compatibility)
  vegetableName?: string;
  vegetableImageUrl?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id?: number;
  userId: number;
  user?: User;
  orderDate: Date;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  notes?: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface CreateOrderRequest {
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}