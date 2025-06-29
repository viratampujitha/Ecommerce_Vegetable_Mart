export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Vegetable {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  category?: Category;
  inStock: boolean;
  stockQuantity: number;
  unit: string; // kg, piece, bunch, etc.
  nutritionInfo?: string;
  origin?: string;
  isOrganic: boolean;
  createdAt?: Date;
}

export interface CartItem {
  id?: number;
  vegetable: Vegetable;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}