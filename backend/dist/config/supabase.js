"use strict";
// ============================================
// Supabase Client Configuration - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.testSupabaseConnection = testSupabaseConnection;
exports.query = query;
exports.insert = insert;
exports.update = update;
exports.remove = remove;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = require("./logger");
const supabaseUrl = process.env.SUPABASE_URL;
// IMPORTANT: Backend MUST use SERVICE_ROLE_KEY to bypass RLS for server-side operations
// ANON_KEY is subject to RLS and should only be used for client-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isTestEnv = process.env.NODE_ENV === 'test';
// Create Supabase client or mock for test environment
let supabaseClient = null;
if (!supabaseUrl || !supabaseServiceKey) {
    if (isTestEnv) {
        // In test environment, allow tests to run with mocked client
        logger_1.logger.warn('Supabase credentials not configured. Running in test mode.');
    }
    else {
        logger_1.logger.error('Missing Supabase credentials. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
        process.exit(1);
    }
}
else {
    supabaseClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    logger_1.logger.info('Supabase client initialized with service role key (RLS bypassed)');
}
// Export supabase client (may be null in test environment without env vars)
exports.supabase = supabaseClient;
// Test connection
async function testSupabaseConnection() {
    try {
        const { error } = await exports.supabase.from('categories').select('*').limit(1);
        if (error)
            throw error;
        logger_1.logger.info('✅ Supabase connection established successfully');
        return true;
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to connect to Supabase:', error);
        return false;
    }
}
// Helper functions for common operations
async function query(table, options = {}) {
    let query = exports.supabase.from(table).select(options.select || '*');
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
    if (error)
        throw error;
    return data;
}
async function insert(table, data) {
    const { data: result, error } = await exports.supabase.from(table).insert(data).select().single();
    if (error)
        throw error;
    return result;
}
async function update(table, id, data) {
    const { data: result, error } = await exports.supabase.from(table).update(data).eq('id', id).select().single();
    if (error)
        throw error;
    return result;
}
async function remove(table, id) {
    const { error } = await exports.supabase.from(table).delete().eq('id', id);
    if (error)
        throw error;
    return true;
}
//# sourceMappingURL=supabase.js.map