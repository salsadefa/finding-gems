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
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

// Creator Profile (extends User for creators)
export interface CreatorProfile {
  userId: string;
  bio: string;
  professionalBackground: string; // e.g., "UI/UX Designer", "Full-Stack Developer"
  expertise: string[];
  portfolioUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  totalWebsites: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
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
  category: Category;
  creatorId: string;
  creator: User;
  creatorProfile: CreatorProfile;
  thumbnail: string;
  screenshots: string[];
  demoVideoUrl?: string;
  externalUrl: string;
  techStack: string[];
  useCases: string[];
  faq: FAQ[];
  pricing: PricingOption[];
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

// Pricing Option
export interface PricingOption {
  id: string;
  type: 'lifetime' | 'subscription';
  name: string;
  price: number; // in IDR
  period?: string; // e.g., "monthly", "yearly" for subscriptions
  description?: string;
  features: string[];
  isPopular?: boolean;
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

// Purchase
export interface Purchase {
  id: string;
  websiteId: string;
  website: Website;
  buyerId: string;
  buyer: User;
  pricingOptionId: string;
  pricingOption: PricingOption;
  amount: number;
  platformFee: number; // Rp1.000
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  paymentMethod: 'native' | 'external';
  externalOrderId?: string;
  createdAt: string;
  approvedAt?: string;
  accessDetails?: string;
}

// Trial
export interface Trial {
  id: string;
  websiteId: string;
  website: Website;
  userId: string;
  user: User;
  status: 'active' | 'expired' | 'converted';
  createdAt: string;
  expiresAt?: string;
  accessDetails?: string;
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
  purchases: number;
  revenue: number;
  trials: number;
  conversionRate: number;
}

// Platform Stats (Admin)
export interface PlatformStats {
  totalWebsites: number;
  totalCreators: number;
  totalBuyers: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingReports: number;
}

// Search/Filter
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  priceRange?: { min: number; max: number };
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
