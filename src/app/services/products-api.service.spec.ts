import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsResponse } from '../models/product.model';
import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsApiService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ProductsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests products from the expected endpoint and maps response data', () => {
    const mockResponse: ProductsResponse = {
      products: [
        {
          id: 1,
          title: 'Phone X',
          description: 'A smartphone',
          category: 'smartphones',
          price: 799,
          rating: 4.6,
          brand: 'Acme',
          stock: 12,
          thumbnail: 'https://cdn.example.com/phone.jpg'
        }
      ],
      total: 1,
      skip: 0,
      limit: 100
    };

    let responseTitle = '';
    service.getProducts().subscribe((products) => {
      responseTitle = products[0].title;
    });

    const req = httpMock.expectOne('https://dummyjson.com/products?limit=100');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(responseTitle).toBe('Phone X');
  });
});
