export interface Review {
  id: string;
  food_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
}
