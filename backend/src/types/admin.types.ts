// ============================================
// Admin Types - Finding Gems Backend
// ============================================

export interface PlatformStats {
  totalWebsites: number;
  totalCreators: number;
  totalBuyers: number;
  totalUsers: number;
  pendingWebsites: number;
  pendingApplications: number;
  pendingReports: number;
  websitesThisMonth: number;
  usersThisMonth: number;
}

export interface WebsiteModeration {
  id: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  adminNote?: string;
}

export interface UserModeration {
  id: string;
  isActive: boolean;
  role: 'visitor' | 'buyer' | 'creator' | 'admin';
  adminNote?: string;
}

export interface ReportAction {
  status: 'reviewed' | 'resolved' | 'dismissed';
  resolution?: string;
}

export interface AdminFilters {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
