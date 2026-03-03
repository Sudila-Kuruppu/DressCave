// Supabase cart client
// Placeholder - to be implemented in future stories

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  custom_measurements: Record<string, string> | null;
  created_at: string;
}

export async function getCart(userId: string) {
  // TODO: Implement with Supabase client
  return [];
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  // TODO: Implement with Supabase client
  return null;
}

export async function updateCartItem(itemId: string, quantity: number) {
  // TODO: Implement with Supabase client
  return null;
}

export async function removeFromCart(itemId: string) {
  // TODO: Implement with Supabase client
  return null;
}
