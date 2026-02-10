#!/usr/bin/env node
/**
 * Migration Runner Script
 * 
 * Applies SQL migration to Supabase database using service role credentials.
 * Usage: node apply-migration.js <migration-file>
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function applyMigration(migrationFile) {
  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials in .env');
    console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Read migration file
  const migrationPath = path.join(__dirname, migrationFile);
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Error: Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  console.log(`📄 Reading migration: ${path.basename(migrationFile)}`);
  console.log(`📊 SQL size: ${(sql.length / 1024).toFixed(2)} KB`);

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('\n🔌 Connecting to Supabase...');

  try {
    // Split SQL by statements (handle multi-statement migrations)
    // Note: This is a simple split - for complex migrations, use a proper SQL parser
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // If exec_sql RPC doesn't exist, try direct query
        const { error: directError } = await supabase.from('_migrations').select('*').limit(0);
        
        if (directError && directError.code === 'PGRST116') {
          // Table doesn't exist - use alternative method
          console.log('\n\n⚠️  Cannot execute via Supabase client.');
          console.log('📋 Please apply migration manually:\n');
          console.log('1. Go to: https://supabase.com/dashboard');
          console.log('2. Select your project');
          console.log('3. Go to SQL Editor');
          console.log('4. Copy & paste contents of:', migrationFile);
          console.log('5. Click "Run"\n');
          process.exit(1);
        }
        
        console.log(' ❌');
        console.error(`\n❌ Error executing statement ${i + 1}:`);
        console.error(error);
        process.exit(1);
      }

      console.log(' ✅');
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n🔍 Verifying tables...');

    // Verify tables were created
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['threads', 'thread_participants', 'messages'])
      .eq('table_schema', 'public');

    if (tableError) {
      console.log('⚠️  Could not verify tables (this is OK if migration succeeded)');
    } else {
      console.log(`✅ Found ${tables?.length || 0} tables: ${tables?.map(t => t.table_name).join(', ')}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Unexpected error:');
    console.error(err);
    process.exit(1);
  }
}

// Main
const migrationFile = process.argv[2] || 'prisma/migrations/003_messaging_system.sql';
applyMigration(migrationFile);
