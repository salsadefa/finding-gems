// ============================================
// Category Types - Finding Gems Backend
// ============================================

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
}
