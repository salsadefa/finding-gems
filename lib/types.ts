// ============================================
// DUALANGKA TYPE DEFINITIONS
// ============================================

// User Roles
export type UserRole = 'visitor' | 'buyer' | 'creator' | 'admin';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

// Creator Profile (extends User for creators)
export interface CreatorProfile {
  userId: string;
  bio: string;
  role?: string; // e.g. "Senior Frontend Engineer"
  institution?: string; // e.g. "at GoTo Financial"
  professionalBackground: string; // e.g., "UI/UX Designer", "Full-Stack Developer"
  expertise: string[];
  portfolioUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  totalWebsites: number;
  rating: number;
  reviewCount: number;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    website?: string;
  };
  otherProducts?: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    category: { name: string };
  }[];
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  websiteCount: number;
}

// Website Listing
export interface Website {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  category?: Category;
  creatorId: string;
  creator?: User;
  creatorProfile?: CreatorProfile;
  thumbnail: string;
  screenshots?: string[];
  demoVideoUrl?: string;
  externalUrl: string;
  techStack?: string[];
  useCases?: string[];
  faq?: FAQ[];
  hasFreeTrial: boolean;
  freeTrialDetails?: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  clickCount: number;
  status: 'draft' | 'pending' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// FAQ Item
export interface FAQ {
  question: string;
  answer: string;
}

// Review
export interface Review {
  id: string;
  websiteId: string;
  userId: string;
  user: User;
  rating: number; // 1-5
  title: string;
  content: string;
  createdAt: string;
  helpfulCount: number;
}


// Bookmark
export interface Bookmark {
  id: string;
  websiteId: string;
  website: Website;
  userId: string;
  createdAt: string;
}

// Message Thread
export interface MessageThread {
  id: string;
  participants: User[];
  websiteId?: string;
  website?: Website;
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Message
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Report
export interface Report {
  id: string;
  websiteId: string;
  website: Website;
  reporterId: string;
  reporter: User;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  resolution?: string;
}

// Creator Application
export interface CreatorApplication {
  id: string;
  userId: string;
  user: User;
  bio: string;
  professionalBackground: string;
  expertise: string[];
  portfolioUrl?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Analytics
export interface WebsiteAnalytics {
  websiteId: string;
  views: number;
  clicks: number;
  ctr: number;
}

// Platform Stats (Admin)
export interface PlatformStats {
  totalWebsites: number;
  totalCreators: number;
  totalBuyers: number;
  pendingVerifications: number;
  pendingReports: number;
}

// Search/Filter
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  hasFreeTrial?: boolean;
  minRating?: number;
  sortBy?: 'alphabetical' | 'newest' | 'rating' | 'popular';
}

// Pagination
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
