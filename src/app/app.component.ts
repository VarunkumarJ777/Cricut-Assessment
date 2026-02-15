import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ProductFiltersComponent } from './components/product-filters.component';
import { ProductListComponent } from './components/product-list.component';
import { ProductsFacade, SortOption } from './state/products.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, ProductFiltersComponent, ProductListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly facade = inject(ProductsFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly vm$ = this.facade.vm$;

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly categoryControl = new FormControl('all', { nonNullable: true });
  readonly sortControl = new FormControl<SortOption>('relevance', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(180), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.facade.setSearchTerm(term));

    this.categoryControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((category) => this.facade.setCategoryFilter(category));

    this.sortControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((sort) => this.facade.setSortOption(sort));
  }

  refreshProducts(): void {
    this.facade.refresh();
  }

  onSearchChanged(term: string): void {
    this.facade.setSearchTerm(term);
  }

  onCategoryChanged(category: string): void {
    this.facade.setCategoryFilter(category);
  }

  selectCategory(category: string): void {
    this.categoryControl.setValue(category, { emitEvent: false });
    this.facade.setCategoryFilter(category);
  }

  onSortChanged(sort: SortOption): void {
    this.facade.setSortOption(sort);
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue('all', { emitEvent: false });
    this.sortControl.setValue('relevance', { emitEvent: false });

    this.facade.setSearchTerm('');
    this.facade.setCategoryFilter('all');
    this.facade.setSortOption('relevance');
  }
}
