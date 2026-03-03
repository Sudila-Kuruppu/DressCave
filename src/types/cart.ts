// Cart types

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    slug: string;
  };
  variant_id?: string;
  quantity: number;
  custom_measurements?: Record<string, string>;
  price: number;
  created_at: string;
}

export interface CartSummary {
  item_count: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}
