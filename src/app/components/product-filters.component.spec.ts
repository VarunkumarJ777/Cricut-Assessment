import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { ProductFiltersComponent } from './product-filters.component';
import { SortOption } from '../state/products.facade';

describe('ProductFiltersComponent', () => {
  let fixture: ComponentFixture<ProductFiltersComponent>;
  let component: ProductFiltersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFiltersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFiltersComponent);
    component = fixture.componentInstance;
    component.searchControl = new FormControl('', { nonNullable: true });
    component.categoryControl = new FormControl('all', { nonNullable: true });
    component.sortControl = new FormControl<SortOption>('relevance', { nonNullable: true });
    component.categoryOptions = ['smartphones', 'laptops'];
    fixture.detectChanges();
  });

  it('renders category options plus default option', () => {
    const options = Array.from(fixture.nativeElement.querySelectorAll('select')[0].options) as HTMLOptionElement[];
    expect(options.map((o) => o.value)).toEqual(['all', 'smartphones', 'laptops']);
  });

  it('updates bound controls from user input', () => {
    const searchInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    searchInput.value = 'phone';
    searchInput.dispatchEvent(new Event('input'));

    const selects = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    selects[0].value = 'smartphones';
    selects[0].dispatchEvent(new Event('change'));
    selects[1].value = 'priceLow';
    selects[1].dispatchEvent(new Event('change'));

    expect(component.searchControl.value).toBe('phone');
    expect(component.categoryControl.value).toBe('smartphones');
    expect(component.sortControl.value).toBe('priceLow');
  });

  it('emits search/category/sort change events from input controls', () => {
    spyOn(component.searchChange, 'emit');
    spyOn(component.categoryChange, 'emit');
    spyOn(component.sortChange, 'emit');

    const searchInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    searchInput.value = 'laptop';
    searchInput.dispatchEvent(new Event('input'));

    const selects = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    selects[0].value = 'laptops';
    selects[0].dispatchEvent(new Event('change'));
    selects[1].value = 'ratingHigh';
    selects[1].dispatchEvent(new Event('change'));

    expect(component.searchChange.emit).toHaveBeenCalledWith('laptop');
    expect(component.categoryChange.emit).toHaveBeenCalledWith('laptops');
    expect(component.sortChange.emit).toHaveBeenCalledWith('ratingHigh');
  });

  it('emits refreshClick when button is clicked', () => {
    spyOn(component.refreshClick, 'emit');
    const button = fixture.nativeElement.querySelector('.refresh-btn') as HTMLButtonElement;
    button.click();
    expect(component.refreshClick.emit).toHaveBeenCalled();
  });

  it('emits resetClick when reset button is clicked', () => {
    spyOn(component.resetClick, 'emit');
    const button = fixture.nativeElement.querySelector('.reset-btn') as HTMLButtonElement;
    button.click();
    expect(component.resetClick.emit).toHaveBeenCalled();
  });
});
