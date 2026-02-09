// ============================================
// Tool Request Types - Finding Gems Backend
// ============================================

export interface CreateToolRequestBody {
  title: string;
  description: string;
  categoryId?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
}

export interface CreateToolRequestResponseBody {
  message: string;
  websiteId?: string;
  websiteSlug?: string;
}

export interface ToolRequestFilters {
  search?: string;
  category?: string; // category slug
  status?: 'open' | 'closed';
  sortBy?: 'newest' | 'recent_activity';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface HideBody {
  reason?: string;
}
