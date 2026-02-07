// ============================================
// Simple In-Memory Cache Middleware
// Best Practice: Cache frequently accessed, rarely changed data
// ============================================

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 60 * 1000; // 60 seconds default

  constructor() {
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private generateETag(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `"${Math.abs(hash).toString(16)}"`;
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(key: string, data: any, ttl?: number): CacheEntry {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      etag: this.generateETag(data)
    };
    this.cache.set(key, entry);
    
    // If custom TTL, schedule deletion
    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl);
    }
    
    return entry;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Invalidate keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton cache instance
export const apiCache = new SimpleCache();

// Cache configuration per endpoint pattern
// OPTIMIZATION: Increased TTL to reduce cold requests
export const cacheConfig: Record<string, number> = {
  '/api/v1/categories': 300000,   // 5 minutes - rarely changes
  '/api/v1/websites': 120000,     // 2 minutes - increased for better perf
};

/**
 * Cache Middleware for GET requests
 * Best Practice: Cache public, read-only endpoints
 */
export function cacheMiddleware(ttl?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Don't cache authenticated requests (user-specific data)
    if (req.headers.authorization) {
      return next();
    }

    // Generate cache key from URL + query params
    const cacheKey = `${req.originalUrl}`;
    
    // Check for cached response
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      // Check If-None-Match header for conditional request
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag === cached.etag) {
        return res.status(304).end();
      }

      // Return cached response with appropriate headers
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${Math.floor((ttl || 60000) / 1000)}`,
        'ETag': cached.etag
      });
      return res.json(cached.data);
    }

    // Store original json function
    const originalJson = res.json.bind(res);

    // Override json to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entry = apiCache.set(cacheKey, data, ttl);
        
        res.set({
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${Math.floor((ttl || 60000) / 1000)}`,
          'ETag': entry.etag
        });
      }
      
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache for specific patterns (call after mutations)
 */
export function invalidateCache(patterns: string[]): void {
  patterns.forEach(pattern => apiCache.invalidate(pattern));
  logger.debug(`Cache invalidated for patterns: ${patterns.join(', ')}`);
}
