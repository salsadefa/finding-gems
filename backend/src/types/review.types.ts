// ============================================
// Review Types - Finding Gems Backend
// ============================================

export interface CreateReviewRequest {
  websiteId: string;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
}

export interface ReviewFilters {
  websiteId?: string;
  userId?: string;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
