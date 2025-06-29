import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Vegetable, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api'; // Updated to HTTP port 5000
  private fallbackToMock = true; // Enable fallback to mock data if API is not available

  // Mock data as fallback
  private mockCategories: Category[] = [
    { id: 1, name: 'Leafy Greens', description: 'Fresh leafy vegetables' },
    { id: 2, name: 'Root Vegetables', description: 'Nutritious root vegetables' },
    { id: 3, name: 'Fruits', description: 'Fresh vegetables that are technically fruits' },
    { id: 4, name: 'Herbs', description: 'Fresh aromatic herbs' }
  ];

  private mockVegetables: Vegetable[] = [
    {
      id: 1,
      name: 'Fresh Spinach',
      description: 'Organic fresh spinach leaves, perfect for salads and cooking',
      price: 45.99,
      imageUrl: 'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg',
      categoryId: 1,
      inStock: true,
      stockQuantity: 50,
      unit: 'bunch',
      isOrganic: true,
      origin: 'Local Farm'
    },
    {
      id: 2,
      name: 'Organic Carrots',
      description: 'Sweet and crunchy organic carrots, great for snacking and cooking',
      price: 35.49,
      imageUrl: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
      categoryId: 2,
      inStock: true,
      stockQuantity: 75,
      unit: 'kg',
      isOrganic: true,
      origin: 'Punjab'
    },
    {
      id: 3,
      name: 'Fresh Tomatoes',
      description: 'Juicy red tomatoes, perfect for salads and sauces',
      price: 55.99,
      imageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
      categoryId: 3,
      inStock: true,
      stockQuantity: 30,
      unit: 'kg',
      isOrganic: false,
      origin: 'Maharashtra'
    },
    {
      id: 4,
      name: 'Fresh Basil',
      description: 'Aromatic fresh basil leaves, perfect for Italian dishes',
      price: 25.99,
      imageUrl: 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg',
      categoryId: 4,
      inStock: true,
      stockQuantity: 25,
      unit: 'pack',
      isOrganic: true,
      origin: 'Local Greenhouse'
    },
    {
      id: 5,
      name: 'Broccoli',
      description: 'Fresh green broccoli crowns, packed with nutrients',
      price: 65.49,
      imageUrl: 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg',
      categoryId: 1,
      inStock: true,
      stockQuantity: 40,
      unit: 'head',
      isOrganic: false,
      origin: 'Himachal Pradesh'
    },
    {
      id: 6,
      name: 'Sweet Potatoes',
      description: 'Orange sweet potatoes, naturally sweet and nutritious',
      price: 42.99,
      imageUrl: 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg',
      categoryId: 2,
      inStock: true,
      stockQuantity: 60,
      unit: 'kg',
      isOrganic: true,
      origin: 'Tamil Nadu'
    }
  ];

  private vegetablesSubject = new BehaviorSubject<Vegetable[]>(this.mockVegetables);
  public vegetables$ = this.vegetablesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`)
      .pipe(
        catchError(error => {
          console.warn('API not available, using mock data:', error);
          return of(this.mockCategories);
        })
      );
  }

  getVegetables(): Observable<Vegetable[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vegetables`)
      .pipe(
        map(vegetables => vegetables.map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          price: v.price,
          imageUrl: v.imageUrl,
          categoryId: v.categoryId,
          category: { id: v.categoryId, name: v.categoryName },
          inStock: v.inStock,
          stockQuantity: v.stockQuantity,
          unit: v.unit,
          nutritionInfo: v.nutritionInfo,
          origin: v.origin,
          isOrganic: v.isOrganic,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined
        }))),
        catchError(error => {
          console.warn('API not available, using mock data:', error);
          return of(this.mockVegetables.map(v => ({
            ...v,
            category: this.mockCategories.find(c => c.id === v.categoryId)
          })));
        })
      );
  }

  getVegetableById(id: number): Observable<Vegetable | undefined> {
    return this.http.get<any>(`${this.apiUrl}/vegetables/${id}`)
      .pipe(
        map(v => v ? {
          id: v.id,
          name: v.name,
          description: v.description,
          price: v.price,
          imageUrl: v.imageUrl,
          categoryId: v.categoryId,
          category: { id: v.categoryId, name: v.categoryName },
          inStock: v.inStock,
          stockQuantity: v.stockQuantity,
          unit: v.unit,
          nutritionInfo: v.nutritionInfo,
          origin: v.origin,
          isOrganic: v.isOrganic,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined
        } : undefined),
        catchError(error => {
          console.warn('API not available, using mock data:', error);
          const vegetable = this.mockVegetables.find(v => v.id === id);
          if (vegetable) {
            vegetable.category = this.mockCategories.find(c => c.id === vegetable.categoryId);
          }
          return of(vegetable);
        })
      );
  }

  getVegetablesByCategory(categoryId: number): Observable<Vegetable[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vegetables/category/${categoryId}`)
      .pipe(
        map(vegetables => vegetables.map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          price: v.price,
          imageUrl: v.imageUrl,
          categoryId: v.categoryId,
          category: { id: v.categoryId, name: v.categoryName },
          inStock: v.inStock,
          stockQuantity: v.stockQuantity,
          unit: v.unit,
          nutritionInfo: v.nutritionInfo,
          origin: v.origin,
          isOrganic: v.isOrganic,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined
        }))),
        catchError(error => {
          console.warn('API not available, using mock data:', error);
          const vegetables = this.mockVegetables
            .filter(v => v.categoryId === categoryId)
            .map(v => ({
              ...v,
              category: this.mockCategories.find(c => c.id === v.categoryId)
            }));
          return of(vegetables);
        })
      );
  }

  searchVegetables(query: string): Observable<Vegetable[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vegetables/search?query=${encodeURIComponent(query)}`)
      .pipe(
        map(vegetables => vegetables.map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          price: v.price,
          imageUrl: v.imageUrl,
          categoryId: v.categoryId,
          category: { id: v.categoryId, name: v.categoryName },
          inStock: v.inStock,
          stockQuantity: v.stockQuantity,
          unit: v.unit,
          nutritionInfo: v.nutritionInfo,
          origin: v.origin,
          isOrganic: v.isOrganic,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined
        }))),
        catchError(error => {
          console.warn('API not available, using mock data:', error);
          const searchResults = this.mockVegetables
            .filter(v => 
              v.name.toLowerCase().includes(query.toLowerCase()) ||
              v.description.toLowerCase().includes(query.toLowerCase())
            )
            .map(v => ({
              ...v,
              category: this.mockCategories.find(c => c.id === v.categoryId)
            }));
          return of(searchResults);
        })
      );
  }
}