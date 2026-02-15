import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Product } from '../models/product.model';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  const products: Product[] = [
    {
      id: 1,
      title: 'Phone X',
      description: 'A smartphone with a long description that should be truncated by default to keep cards concise and readable.',
      category: 'smartphones',
      price: 799,
      rating: 4.6,
      brand: 'Acme',
      stock: 12,
      thumbnail: 'phone.jpg'
    },
    {
      id: 2,
      title: 'Laptop Air',
      description: 'A laptop',
      category: 'laptops',
      price: 1099,
      rating: 4.7,
      brand: 'Acme',
      stock: 7,
      thumbnail: 'laptop.jpg'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('renders one card per product', () => {
    component.products = products;
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Phone X');
    expect(fixture.nativeElement.textContent).toContain('Laptop Air');
  });

  it('returns product id in trackById', () => {
    expect(component.trackById(0, products[0])).toBe(1);
  });

  it('opens preview modal on product click and closes on close button', () => {
    component.products = products;
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.product-card') as HTMLElement;
    card.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.preview-modal')).toBeTruthy();

    const closeBtn = fixture.nativeElement.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.preview-modal')).toBeNull();
  });

  it('toggles long description text with show more/show less', () => {
    component.products = products;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Show more');

    const toggle = fixture.nativeElement.querySelector('.description-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Show less');
    expect(fixture.nativeElement.textContent).toContain(
      'A smartphone with a long description that should be truncated by default to keep cards concise and readable.'
    );
  });
});
