# Cricut Assessment (Angular 18+)

Small Angular 18 standalone app that demonstrates component architecture, RxJS data flow, and robust UI states.

## App Summary

This app loads products from a public API:

- API: `https://dummyjson.com/products?limit=100`
- Domain: product catalog explorer
- Features:
  - Search by title/brand/description
  - Category filter
  - Sort (relevance, price low-high, price high-low, rating)
  - Manual reload
  - Loading, error, empty, and success states

## Requirement Coverage

- Angular architecture:
  - Container component: `src/app/app.component.ts`
  - Presentational components: `src/app/components/product-filters.component.ts`, `src/app/components/product-list.component.ts`
  - Service + facade separation: `src/app/services/products-api.service.ts`, `src/app/state/products.facade.ts`
- RxJS management:
  - Stream creation with `Subject`/`BehaviorSubject`
  - Operators: `switchMap`, `combineLatest`, `map`, `startWith`, `catchError`, `shareReplay`
  - Transform to view model in `ProductsFacade`
  - Cleanup with `takeUntilDestroyed` in `src/app/app.component.ts`
- Robustness:
  - Explicit loading/error/empty UI handling in `src/app/app.component.html`
- Code quality:
  - Strictly typed models and view models
  - Focused unit tests for service, facade, and components

## Run Locally

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Note

Dependency installation and test execution were not possible in this environment due restricted network access.
