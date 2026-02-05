// ============================================
// Creator Profile Types - Finding Gems Backend
// ============================================

export interface CreatorProfileData {
  bio?: string;
  professionalBackground?: string;
  expertise?: string[];
  portfolioUrl?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    tiktok?: string;
    x?: string;
    website?: string;
  };
}

export interface CreatorPublicProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  professionalBackground?: string;
  expertise?: string[];
  portfolioUrl?: string;
  isVerified: boolean;
  totalWebsites: number;
  rating: number;
  reviewCount: number;
  socialLinks?: Record<string, string>;
  createdAt: string;
}
