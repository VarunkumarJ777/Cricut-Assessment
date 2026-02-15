import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  @Input({ required: true }) products: Product[] = [];
  private readonly expandedIds = new Set<number>();
  private readonly maxDescriptionLength = 90;
  selectedProduct: Product | null = null;

  trackById(_: number, product: Product): number {
    return product.id;
  }

  isDescriptionLong(product: Product): boolean {
    return product.description.length > this.maxDescriptionLength;
  }

  isExpanded(productId: number): boolean {
    return this.expandedIds.has(productId);
  }

  toggleDescription(productId: number): void {
    if (this.expandedIds.has(productId)) {
      this.expandedIds.delete(productId);
      return;
    }
    this.expandedIds.add(productId);
  }

  getDescriptionText(product: Product): string {
    if (this.isExpanded(product.id) || !this.isDescriptionLong(product)) {
      return product.description;
    }
    return `${product.description.slice(0, this.maxDescriptionLength)}...`;
  }

  formatRating(rating: number): string {
    return Number.isFinite(rating) ? rating.toFixed(1) : '0.0';
  }

  getOriginalPrice(price: number): number {
    if (!Number.isFinite(price)) {
      return 0;
    }
    return Math.round(price * 1.22);
  }

  openPreview(product: Product): void {
    this.selectedProduct = product;
  }

  closePreview(): void {
    this.selectedProduct = null;
  }
}
