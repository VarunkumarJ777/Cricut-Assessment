import { TestBed } from '@angular/core/testing';
import { NEVER, filter, firstValueFrom, of, take, throwError } from 'rxjs';

import { Product } from '../models/product.model';
import { ProductsApiService } from '../services/products-api.service';
import { ProductsFacade } from './products.facade';

describe('ProductsFacade', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'Phone X',
      description: 'A flagship phone',
      category: 'smartphones',
      price: 799,
      rating: 4.4,
      brand: 'Acme',
      stock: 9,
      thumbnail: 'phone.jpg'
    },
    {
      id: 2,
      title: 'Kitchen Pro Blender',
      description: 'High-speed blender',
      category: 'kitchen-appliances',
      price: 149,
      rating: 4.8,
      brand: 'HomeCo',
      stock: 20,
      thumbnail: 'blender.jpg'
    }
  ];

  let productsApi: jasmine.SpyObj<ProductsApiService>;
  let facade: ProductsFacade;

  beforeEach(() => {
    productsApi = jasmine.createSpyObj<ProductsApiService>('ProductsApiService', ['getProducts']);

    TestBed.configureTestingModule({
      providers: [ProductsFacade, { provide: ProductsApiService, useValue: productsApi }]
    });
  });

  it('emits loading state while request is in-flight', async () => {
    productsApi.getProducts.and.returnValue(NEVER);
    facade = TestBed.inject(ProductsFacade);

    const vm = await firstValueFrom(facade.vm$.pipe(take(1)));

    expect(vm.status).toBe('loading');
  });

  it('emits ready state with category options after successful fetch', async () => {
    productsApi.getProducts.and.returnValue(of(mockProducts));
    facade = TestBed.inject(ProductsFacade);

    const vm = await firstValueFrom(
      facade.vm$.pipe(
        filter((value) => value.status === 'ready'),
        take(1)
      )
    );

    expect(vm.status).toBe('ready');
    expect(vm.totalCount).toBe(2);
    expect(vm.categoryOptions).toEqual(['kitchen-appliances', 'smartphones']);
  });

  it('filters by search and category and sorts by highest rating', async () => {
    productsApi.getProducts.and.returnValue(of(mockProducts));
    facade = TestBed.inject(ProductsFacade);

    facade.setSearchTerm('pro');
    facade.setCategoryFilter('kitchen-appliances');
    facade.setSortOption('ratingHigh');

    const vm = await firstValueFrom(
      facade.vm$.pipe(
        filter((value) => value.status === 'ready' && value.activeSearch === 'pro'),
        take(1)
      )
    );

    expect(vm.filteredCount).toBe(1);
    expect(vm.products[0].title).toBe('Kitchen Pro Blender');
  });

  it('sorts products by price low-to-high and high-to-low', async () => {
    const pricedProducts: Product[] = [
      { ...mockProducts[0], id: 11, title: 'High', price: 900 },
      { ...mockProducts[0], id: 12, title: 'Low', price: 100 },
      { ...mockProducts[0], id: 13, title: 'Mid', price: 500 }
    ];

    productsApi.getProducts.and.returnValue(of(pricedProducts));
    facade = TestBed.inject(ProductsFacade);

    facade.setSortOption('priceLow');
    const lowVm = await firstValueFrom(
      facade.vm$.pipe(
        filter((value) => value.status === 'ready' && value.activeSort === 'priceLow'),
        take(1)
      )
    );
    expect(lowVm.products.map((p) => p.title)).toEqual(['Low', 'Mid', 'High']);

    facade.setSortOption('priceHigh');
    const highVm = await firstValueFrom(
      facade.vm$.pipe(
        filter((value) => value.status === 'ready' && value.activeSort === 'priceHigh'),
        take(1)
      )
    );
    expect(highVm.products.map((p) => p.title)).toEqual(['High', 'Mid', 'Low']);
  });

  it('emits error state when API call fails', async () => {
    productsApi.getProducts.and.returnValue(throwError(() => new Error('network error')));
    facade = TestBed.inject(ProductsFacade);

    const vm = await firstValueFrom(facade.vm$.pipe(filter((value) => value.status === 'error'), take(1)));

    expect(vm.products).toEqual([]);
    expect(vm.errorMessage).toBe('Unable to load products. Please try again.');
  });

  it('handles products with missing fields without breaking search/filter flow', async () => {
    const incompleteProduct = {
      id: 3,
      title: 'Unnamed',
      category: 'misc',
      price: 20,
      rating: 0,
      stock: 2,
      thumbnail: 'x.jpg'
    } as Product;

    productsApi.getProducts.and.returnValue(of([incompleteProduct]));
    facade = TestBed.inject(ProductsFacade);
    facade.setSearchTerm('any');

    const vm = await firstValueFrom(
      facade.vm$.pipe(
        filter((value) => value.status === 'ready'),
        take(1)
      )
    );

    expect(vm.status).toBe('ready');
    expect(vm.filteredCount).toBe(0);
  });
});
