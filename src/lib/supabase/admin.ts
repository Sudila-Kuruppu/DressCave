// Supabase admin client
// Placeholder - to be implemented in future stories

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  created_at: string;
}

export async function createProduct(data: Omit<AdminProduct, 'id' | 'created_at'>) {
  // TODO: Implement with Supabase client (admin only)
  return null;
}

export async function updateProduct(id: string, data: Partial<AdminProduct>) {
  // TODO: Implement with Supabase client (admin only)
  return null;
}

export async function deleteProduct(id: string) {
  // TODO: Implement with Supabase client (admin only)
  return null;
}

export async function getAllProducts() {
  // TODO: Implement with Supabase client (admin only)
  return [];
}
