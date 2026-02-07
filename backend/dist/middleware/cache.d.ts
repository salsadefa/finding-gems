import { Request, Response, NextFunction } from 'express';
interface CacheEntry {
    data: any;
    timestamp: number;
    etag: string;
}
declare class SimpleCache {
    private cache;
    private defaultTTL;
    constructor();
    private generateETag;
    get(key: string): CacheEntry | null;
    set(key: string, data: any, ttl?: number): CacheEntry;
    invalidate(pattern?: string): void;
    private cleanup;
    size(): number;
}
export declare const apiCache: SimpleCache;
export declare const cacheConfig: Record<string, number>;
/**
 * Cache Middleware for GET requests
 * Best Practice: Cache public, read-only endpoints
 */
export declare function cacheMiddleware(ttl?: number): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Clear cache for specific patterns (call after mutations)
 */
export declare function invalidateCache(patterns: string[]): void;
export {};
//# sourceMappingURL=cache.d.ts.map