// ============================================
// Test Setup - Finding Gems Backend
// ============================================
import { jest } from '@jest/globals';

// Mock environment variables for test environment
// Using Object.assign to avoid TypeScript read-only property errors
Object.assign(process.env, {
  NODE_ENV: 'test',
  JWT_SECRET: 'test-jwt-secret-key-at-least-32-characters-long',
  JWT_EXPIRES_IN: '1h',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key-for-testing',
  SUPABASE_SERVICE_KEY: 'test-service-key',
  APP_BASE_URL: 'http://localhost:3000',
});

// Increase timeout for async operations
jest.setTimeout(10000);

