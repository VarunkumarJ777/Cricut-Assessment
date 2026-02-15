export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  brand: string;
  stock: number;
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface ProductsResource {
  status: LoadStatus;
  data: Product[];
  errorMessage: string | null;
}
