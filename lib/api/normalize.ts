// ============================================
// API Response Normalization Utilities
// ============================================
// Converts snake_case API responses to camelCase for frontend consumption

/**
 * Convert snake_case string to camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase string to snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Recursively normalize an object's keys from snake_case to camelCase
 */
export const normalizeKeys = <T>(obj: unknown): T => {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => normalizeKeys(item)) as T;
  }

  if (typeof obj === 'object' && obj !== null) {
    const normalized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      normalized[camelKey] = normalizeKeys(value);
    }
    
    return normalized as T;
  }

  return obj as T;
};

/**
 * Normalize a Website object from API response
 * Maps snake_case fields to camelCase expected by frontend
 */
export const normalizeWebsite = <T extends Record<string, unknown>>(website: T): T => {
  return normalizeKeys<T>(website);
};

/**
 * Normalize an array of Website objects from API response
 */
export const normalizeWebsites = <T extends Record<string, unknown>[]>(websites: T): T => {
  return websites.map(website => normalizeKeys<T[number]>(website)) as T;
};

/**
 * Normalize a Review object from API response
 */
export const normalizeReview = <T extends Record<string, unknown>>(review: T): T => {
  return normalizeKeys<T>(review);
};

/**
 * Normalize an array of Review objects from API response
 */
export const normalizeReviews = <T extends Record<string, unknown>[]>(reviews: T): T => {
  return reviews.map(review => normalizeKeys<T[number]>(review)) as T;
};
