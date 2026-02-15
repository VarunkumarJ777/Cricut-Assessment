import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SortOption } from '../state/products.facade';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFiltersComponent {
  @Input({ required: true }) searchControl!: FormControl<string>;
  @Input({ required: true }) categoryControl!: FormControl<string>;
  @Input({ required: true }) sortControl!: FormControl<SortOption>;
  @Input({ required: true }) categoryOptions: string[] = [];
  @Output() refreshClick = new EventEmitter<void>();
  @Output() resetClick = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortOption>();

  readonly sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'ratingHigh', label: 'Rating: High to Low' }
  ];

  refresh(): void {
    this.refreshClick.emit();
  }

  reset(): void {
    this.resetClick.emit();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.categoryChange.emit(target.value);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortChange.emit(target.value as SortOption);
  }
}
