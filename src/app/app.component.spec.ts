import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from './app.component';
import { ProductsFacade, ProductsViewModel } from './state/products.facade';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let vmSubject: BehaviorSubject<ProductsViewModel>;
  let facadeStub: jasmine.SpyObj<ProductsFacade> & { vm$: BehaviorSubject<ProductsViewModel> };

  beforeEach(async () => {
    vmSubject = new BehaviorSubject<ProductsViewModel>({
      status: 'loading',
      products: [],
      totalCount: 0,
      filteredCount: 0,
      categoryOptions: [],
      activeSearch: '',
      activeCategory: 'all',
      activeSort: 'relevance',
      errorMessage: null
    });

    facadeStub = Object.assign(
      jasmine.createSpyObj<ProductsFacade>('ProductsFacade', ['setSearchTerm', 'setCategoryFilter', 'setSortOption', 'refresh']),
      { vm$: vmSubject }
    );

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: ProductsFacade, useValue: facadeStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('renders loading state initially', () => {
    expect(fixture.nativeElement.textContent).toContain('Loading products...');
  });

  it('renders empty state when no products match', () => {
    vmSubject.next({
      status: 'ready',
      products: [],
      totalCount: 10,
      filteredCount: 0,
      categoryOptions: ['smartphones'],
      activeSearch: 'zzz',
      activeCategory: 'all',
      activeSort: 'relevance',
      errorMessage: null
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No products match the current filters.');
  });

  it('calls refresh when button is clicked', () => {
    vmSubject.next({
      status: 'ready',
      products: [],
      totalCount: 0,
      filteredCount: 0,
      categoryOptions: [],
      activeSearch: '',
      activeCategory: 'all',
      activeSort: 'relevance',
      errorMessage: null
    });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.refresh-btn') as HTMLButtonElement;
    button.click();

    expect(facadeStub.refresh).toHaveBeenCalled();
  });

  it('forwards search, category, and sort changes to facade', () => {
    vmSubject.next({
      status: 'ready',
      products: [],
      totalCount: 3,
      filteredCount: 3,
      categoryOptions: ['smartphones', 'laptops'],
      activeSearch: '',
      activeCategory: 'all',
      activeSort: 'relevance',
      errorMessage: null
    });
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    searchInput.value = 'phone';
    searchInput.dispatchEvent(new Event('input'));

    const selects = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    selects[0].value = 'smartphones';
    selects[0].dispatchEvent(new Event('change'));
    selects[1].value = 'priceHigh';
    selects[1].dispatchEvent(new Event('change'));

    expect(facadeStub.setSearchTerm).toHaveBeenCalledWith('phone');
    expect(facadeStub.setCategoryFilter).toHaveBeenCalledWith('smartphones');
    expect(facadeStub.setSortOption).toHaveBeenCalledWith('priceHigh');
  });

  it('resets controls and notifies facade when reset button is clicked', () => {
    vmSubject.next({
      status: 'ready',
      products: [],
      totalCount: 8,
      filteredCount: 3,
      categoryOptions: ['smartphones', 'laptops'],
      activeSearch: 'phone',
      activeCategory: 'smartphones',
      activeSort: 'priceLow',
      errorMessage: null
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.searchControl.setValue('phone');
    component.categoryControl.setValue('smartphones');
    component.sortControl.setValue('priceLow');

    const resetButton = fixture.nativeElement.querySelector('.reset-btn') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(component.searchControl.value).toBe('');
    expect(component.categoryControl.value).toBe('all');
    expect(component.sortControl.value).toBe('relevance');
    expect(facadeStub.setSearchTerm).toHaveBeenCalledWith('');
    expect(facadeStub.setCategoryFilter).toHaveBeenCalledWith('all');
    expect(facadeStub.setSortOption).toHaveBeenCalledWith('relevance');
  });
});
