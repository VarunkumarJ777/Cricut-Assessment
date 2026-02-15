import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Product, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://dummyjson.com/products?limit=100';

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(this.endpoint)
      .pipe(map((response) => response.products));
  }
}
