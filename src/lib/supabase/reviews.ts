// Supabase reviews client
// Placeholder - to be implemented in future stories

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export async function getReviewsByProduct(productId: string) {
  // TODO: Implement with Supabase client
  return [];
}

export async function createReview(data: Omit<Review, 'id' | 'created_at'>) {
  // TODO: Implement with Supabase client
  return null;
}

export async function getAverageRating(productId: string) {
  // TODO: Implement with Supabase client
  return 0;
}
