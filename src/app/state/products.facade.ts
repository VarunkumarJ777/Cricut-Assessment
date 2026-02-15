import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';

import { Product, ProductsResource } from '../models/product.model';
import { ProductsApiService } from '../services/products-api.service';

export type SortOption = 'relevance' | 'priceLow' | 'priceHigh' | 'ratingHigh';

export interface ProductsViewModel {
  status: ProductsResource['status'];
  products: Product[];
  totalCount: number;
  filteredCount: number;
  categoryOptions: string[];
  activeSearch: string;
  activeCategory: string;
  activeSort: SortOption;
  errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private readonly productsApi = inject(ProductsApiService);

  private readonly refreshTrigger$ = new Subject<void>();
  private readonly searchTerm$ = new BehaviorSubject<string>('');
  private readonly categoryFilter$ = new BehaviorSubject<string>('all');
  private readonly sortOption$ = new BehaviorSubject<SortOption>('relevance');

  private readonly productsResource$ = this.refreshTrigger$.pipe(
    startWith(void 0),
    switchMap(() =>
      this.productsApi.getProducts().pipe(
        map(
          (products): ProductsResource => ({
            status: 'ready',
            data: products,
            errorMessage: null
          })
        ),
        startWith({ status: 'loading', data: [], errorMessage: null } as ProductsResource),
        catchError(() =>
          of({
            status: 'error',
            data: [],
            errorMessage: 'Unable to load products. Please try again.'
          } as ProductsResource)
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly vm$ = combineLatest([
    this.productsResource$,
    this.searchTerm$,
    this.categoryFilter$,
    this.sortOption$
  ]).pipe(
    map(([resource, searchTerm, category, sort]) => {
      const filteredProducts = this.filterProducts(resource.data, searchTerm, category);
      const sortedProducts = this.sortProducts(filteredProducts, sort);

      return {
        status: resource.status,
        products: sortedProducts,
        totalCount: resource.data.length,
        filteredCount: sortedProducts.length,
        categoryOptions: this.buildCategoryOptions(resource.data),
        activeSearch: searchTerm,
        activeCategory: category,
        activeSort: sort,
        errorMessage: resource.errorMessage
      } satisfies ProductsViewModel;
    })
  );

  setSearchTerm(searchTerm: string): void {
    this.searchTerm$.next(searchTerm.trim().toLowerCase());
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter$.next(category);
  }

  setSortOption(sort: SortOption): void {
    this.sortOption$.next(sort);
  }

  refresh(): void {
    this.refreshTrigger$.next();
  }

  private filterProducts(products: Product[], searchTerm: string, category: string): Product[] {
    return products.filter((product) => {
      const title = this.toSearchable(product.title);
      const brand = this.toSearchable(product.brand);
      const description = this.toSearchable(product.description);
      const productCategory = this.toSearchable(product.category);

      const matchesSearch =
        title.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        description.includes(searchTerm);
      const matchesCategory = category === 'all' || productCategory === this.toSearchable(category);

      return matchesSearch && matchesCategory;
    });
  }

  private sortProducts(products: Product[], sort: SortOption): Product[] {
    const copy = [...products];

    switch (sort) {
      case 'priceLow':
        return copy.sort((a, b) => this.compareNumbers(this.toNumber(a.price), this.toNumber(b.price), 'asc'));
      case 'priceHigh':
        return copy.sort((a, b) => this.compareNumbers(this.toNumber(a.price), this.toNumber(b.price), 'desc'));
      case 'ratingHigh':
        return copy.sort((a, b) => this.compareNumbers(this.toNumber(a.rating), this.toNumber(b.rating), 'desc'));
      default:
        return copy;
    }
  }

  private buildCategoryOptions(products: Product[]): string[] {
    return [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  private toSearchable(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return Number.NaN;
  }

  private compareNumbers(a: number, b: number, direction: 'asc' | 'desc'): number {
    const aValid = Number.isFinite(a);
    const bValid = Number.isFinite(b);

    if (!aValid && !bValid) {
      return 0;
    }
    if (!aValid) {
      return 1;
    }
    if (!bValid) {
      return -1;
    }

    return direction === 'asc' ? a - b : b - a;
  }
}
