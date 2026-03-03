// Product types

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id: string;
  category_name?: string;
  image_url: string | null;
  images: string[];
  variants?: ProductVariant[];
  sizes?: string[];
  colors?: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  price: number;
  stock_quantity: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  display_order: number;
}
