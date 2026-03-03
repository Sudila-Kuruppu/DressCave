// Review types

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewInput {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
}
