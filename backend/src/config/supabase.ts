// ============================================
// Supabase Client Configuration - Finding Gems Backend
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL;
// IMPORTANT: Backend MUST use SERVICE_ROLE_KEY to bypass RLS for server-side operations
// ANON_KEY is subject to RLS and should only be used for client-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isTestEnv = process.env.NODE_ENV === 'test';

// Create Supabase client or mock for test environment
let supabaseClient: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseServiceKey) {
  if (isTestEnv) {
    // In test environment, allow tests to run with mocked client
    logger.warn('Supabase credentials not configured. Running in test mode.');
  } else {
    logger.error('Missing Supabase credentials. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }
} else {
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  logger.info('Supabase client initialized with service role key (RLS bypassed)');
}

// Export supabase client (may be null in test environment without env vars)
export const supabase = supabaseClient as SupabaseClient;

// Test connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('categories').select('*').limit(1);
    if (error) throw error;
    logger.info('✅ Supabase connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to Supabase:', error);
    return false;
  }
}

// Helper functions for common operations
export async function query(table: string, options: any = {}) {
  let query = supabase.from(table).select(options.select || '*');
  
  if (options.where) {
    Object.entries(options.where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  if (options.orderBy) {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function insert(table: string, data: any) {
  const { data: result, error } = await supabase.from(table).insert(data).select().single();
  if (error) throw error;
  return result;
}

export async function update(table: string, id: string, data: any) {
  const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
  if (error) throw error;
  return result;
}

export async function remove(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}
