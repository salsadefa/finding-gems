// ============================================
// Analytics API Hooks - Finding Gems Frontend
// ============================================

import { useQuery } from '@tanstack/react-query';
import { api } from './client';

// ============================================
// Types
// ============================================

export interface WebsiteAnalytics {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  viewCount: number;
  clickCount: number;
  bookmarkCount: number;
  reviewCount: number;
  rating: number;
  status: string;
  createdAt: string;
}

export interface CreatorStats {
  totalViews: number;
  totalClicks: number;
  totalBookmarks: number;
  totalSales: number;
  totalRevenue: number;
  totalWebsites: number;
  averageRating: number;
  ctr: number;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  views: number;
  clicks: number;
}

export interface AnalyticsOverview {
  websites: WebsiteAnalytics[];
  stats: CreatorStats;
  trend: TrendDataPoint[];
}

// ============================================
// Query Keys
// ============================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  creator: () => [...analyticsKeys.all, 'creator'] as const,
  creatorWebsites: () => [...analyticsKeys.creator(), 'websites'] as const,
  creatorStats: () => [...analyticsKeys.creator(), 'stats'] as const,
  website: (id: string) => [...analyticsKeys.all, 'website', id] as const,
};

// ============================================
// Creator Analytics Hooks
// ============================================

/**
 * Get creator's website analytics
 * Uses /websites/my-websites to get the creator's websites with analytics data
 */
export const useCreatorWebsites = () => {
  return useQuery({
    queryKey: analyticsKeys.creatorWebsites(),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          websites: Array<{
            id: string;
            name: string;
            slug: string;
            thumbnail: string;
            viewCount: number;
            clickCount: number;
            rating: number;
            status: string;
            createdAt: string;
          }>;
        };
      }>('/websites/my-websites?limit=100');

      return response.data.websites.map(w => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        thumbnail: w.thumbnail,
        viewCount: w.viewCount || 0,
        clickCount: w.clickCount || 0,
        bookmarkCount: 0, // We'll fetch this separately if needed
        reviewCount: 0,
        rating: w.rating || 0,
        status: w.status,
        createdAt: w.createdAt,
      }));
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get creator's aggregated stats
 */
export const useCreatorStats = () => {
  return useQuery({
    queryKey: analyticsKeys.creatorStats(),
    queryFn: async () => {
      // First get all creator's websites
      const websiteResponse = await api.get<{
        success: boolean;
        data: {
          websites: Array<{
            viewCount: number;
            clickCount: number;
            rating: number;
          }>;
        };
      }>('/websites/my-websites?limit=100');

      const websites = websiteResponse.data.websites;
      
      // Get sales data
      const salesResponse = await api.get<{
        success: boolean;
        data: {
          sales: Array<{ total_amount: number }>;
          stats: {
            total_orders: number;
            total_revenue: number;
            platform_fees: number;
            net_revenue: number;
          };
        };
      }>('/billing/creator/sales');

      const totalViews = websites.reduce((sum, w) => sum + (w.viewCount || 0), 0);
      const totalClicks = websites.reduce((sum, w) => sum + (w.clickCount || 0), 0);
      const ratedWebsites = websites.filter(w => w.rating > 0);
      const averageRating = ratedWebsites.length > 0
        ? ratedWebsites.reduce((sum, w) => sum + w.rating, 0) / ratedWebsites.length
        : 0;

      return {
        totalViews,
        totalClicks,
        totalBookmarks: 0, // Can be fetched separately
        totalSales: salesResponse.data.stats?.total_orders || 0,
        totalRevenue: salesResponse.data.stats?.net_revenue || 0,
        totalWebsites: websites.length,
        averageRating: Math.round(averageRating * 10) / 10,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get analytics overview combining websites and stats
 */
export const useAnalyticsOverview = (dateRange: '7d' | '30d' | 'ytd' = '30d') => {
  return useQuery({
    queryKey: [...analyticsKeys.creator(), 'overview', dateRange],
    queryFn: async () => {
      // Get websites
      const websiteResponse = await api.get<{
        success: boolean;
        data: {
          websites: Array<{
            id: string;
            name: string;
            slug: string;
            thumbnail: string;
            viewCount: number;
            clickCount: number;
            rating: number;
            status: string;
            createdAt: string;
          }>;
        };
      }>('/websites/my-websites?limit=100');

      const websites = websiteResponse.data.websites;

      // Get sales data
      let salesStats = { total_orders: 0, net_revenue: 0 };
      try {
        const salesResponse = await api.get<{
          success: boolean;
          data: {
            stats: {
              total_orders: number;
              net_revenue: number;
            };
          };
        }>('/billing/creator/sales');
        salesStats = salesResponse.data.stats || { total_orders: 0, net_revenue: 0 };
      } catch {
        // Sales endpoint might fail for new creators
      }

      // Calculate stats
      const totalViews = websites.reduce((sum, w) => sum + (w.viewCount || 0), 0);
      const totalClicks = websites.reduce((sum, w) => sum + (w.clickCount || 0), 0);
      const ratedWebsites = websites.filter(w => w.rating > 0);
      const averageRating = ratedWebsites.length > 0
        ? ratedWebsites.reduce((sum, w) => sum + w.rating, 0) / ratedWebsites.length
        : 0;

      const stats: CreatorStats = {
        totalViews,
        totalClicks,
        totalBookmarks: 0,
        totalSales: salesStats.total_orders,
        totalRevenue: salesStats.net_revenue,
        totalWebsites: websites.length,
        averageRating: Math.round(averageRating * 10) / 10,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0,
      };

      // Generate trend data (mock for now - would need a real analytics endpoint)
      const trend = generateTrendData(dateRange, totalViews, totalClicks);

      return {
        websites: websites.map(w => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          thumbnail: w.thumbnail,
          viewCount: w.viewCount || 0,
          clickCount: w.clickCount || 0,
          bookmarkCount: 0,
          reviewCount: 0,
          rating: w.rating || 0,
          status: w.status,
          createdAt: w.createdAt,
        })),
        stats,
        trend,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// ============================================
// Website Analytics (Per Website)
// ============================================

/**
 * Get analytics for a specific website
 * Uses /websites/:id to get website with view/click data
 */
export const useWebsiteAnalytics = (websiteId: string) => {
  return useQuery({
    queryKey: analyticsKeys.website(websiteId),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          website: {
            id: string;
            name: string;
            slug: string;
            thumbnail: string;
            viewCount: number;
            clickCount: number;
            rating: number;
            reviewCount: number;
            status: string;
            createdAt: string;
          };
        };
      }>(`/websites/${websiteId}`);

      const website = response.data.website;
      
      // Calculate CTR
      const views = website.viewCount || 0;
      const clicks = website.clickCount || 0;
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';

      // Generate mock trend data based on actual view count
      // In production, this should come from a real analytics endpoint
      const trendData = generateWebsiteTrendData(views, clicks);

      return {
        website: {
          id: website.id,
          name: website.name,
          slug: website.slug,
          thumbnail: website.thumbnail,
          viewCount: views,
          clickCount: clicks,
          rating: website.rating || 0,
          reviewCount: website.reviewCount || 0,
          status: website.status,
          createdAt: website.createdAt,
        },
        analytics: {
          totalViews: views,
          uniqueVisitors: Math.round(views * 0.7), // Estimate
          outboundClicks: clicks,
          ctr: `${ctr}%`,
          history: trendData,
        },
      };
    },
    enabled: !!websiteId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Generate trend data for a specific website
 */
function generateWebsiteTrendData(totalViews: number, totalClicks: number): number[] {
  // Generate 14 days of trend data
  const days = 14;
  const data: number[] = [];
  
  for (let i = 0; i < days; i++) {
    // Random variation around average
    const avgViewsPerDay = totalViews / days;
    const variation = (Math.random() - 0.5) * 0.6; // ±30% variation
    const value = Math.max(5, Math.min(95, Math.round(((avgViewsPerDay * (1 + variation)) / Math.max(totalViews, 1)) * 100)));
    data.push(value);
  }
  
  return data;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate trend data based on date range
 * This is a placeholder - ideally we'd have a real analytics endpoint
 */
function generateTrendData(dateRange: '7d' | '30d' | 'ytd', totalViews: number, totalClicks: number): TrendDataPoint[] {
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const labels = dateRange === '7d' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : null;
  
  const avgDailyViews = Math.round(totalViews / days);
  const avgDailyClicks = Math.round(totalClicks / days);
  
  const data: TrendDataPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some variance to make it look realistic
    const variance = 0.5 + Math.random();
    const views = Math.round(avgDailyViews * variance);
    const clicks = Math.round(avgDailyClicks * variance);
    
    data.push({
      date: date.toISOString().split('T')[0],
      label: labels ? labels[i % 7] : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.max(0, views),
      clicks: Math.max(0, clicks),
    });
  }
  
  // For 7-day view, return the last 7 entries
  if (dateRange === '7d') {
    return data.slice(-7);
  }
  
  // For 30-day, sample every day but show labels weekly
  return data;
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number | null | undefined): string {
  // Handle null, undefined, or NaN
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | null | undefined, currency = 'IDR'): string {
  // Handle null, undefined, or NaN
  if (amount === null || amount === undefined || isNaN(amount)) {
    return currency === 'IDR' ? 'Rp 0' : '$0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
