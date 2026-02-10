#!/usr/bin/env node
/**
 * Verify Migration - Check if messaging tables exist
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function verifyMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔍 Verifying migration...\n');

  try {
    // Test 1: Check if tables exist by trying to query them
    console.log('📋 Test 1: Checking table existence...');
    
    const tests = [
      { name: 'threads', query: supabase.from('threads').select('id').limit(1) },
      { name: 'thread_participants', query: supabase.from('thread_participants').select('id').limit(1) },
      { name: 'messages', query: supabase.from('messages').select('id').limit(1) },
    ];

    for (const test of tests) {
      const { error } = await test.query;
      if (error && error.code === '42P01') {
        console.log(`   ❌ Table '${test.name}' does NOT exist`);
        process.exit(1);
      } else if (error) {
        console.log(`   ⚠️  Table '${test.name}' exists but got error: ${error.message}`);
      } else {
        console.log(`   ✅ Table '${test.name}' exists`);
      }
    }

    // Test 2: Check RPC function
    console.log('\n📋 Test 2: Checking RPC function...');
    const { error: rpcError } = await supabase.rpc('get_threads_for_user', {
      p_user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
    });

    if (rpcError && rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
      console.log('   ❌ RPC function get_threads_for_user does NOT exist');
      process.exit(1);
    } else {
      console.log('   ✅ RPC function get_threads_for_user exists');
    }

    console.log('\n✅ Migration verified successfully!');
    console.log('\n🎉 Messaging system is ready to use!\n');
    
  } catch (err) {
    console.error('\n❌ Verification failed:');
    console.error(err);
    process.exit(1);
  }
}

verifyMigration();
