# Migration Guide - Messaging System

## File Created
`backend/prisma/migrations/003_messaging_system.sql`

## What This Migration Does
Creates the complete messaging infrastructure:
1. **threads** table - stores conversation threads (linked to websites or requests)
2. **thread_participants** table - tracks who's in each thread + unread counts
3. **messages** table - stores all messages
4. Database triggers for auto-updating timestamps and unread counts
5. RPC function `get_threads_for_user` for efficient thread queries
6. Row Level Security (RLS) policies for data protection

## How to Apply Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy the entire contents of `003_messaging_system.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute

### Option 2: Via Supabase CLI
```bash
# If you have supabase CLI installed
supabase db push --db-url "YOUR_DATABASE_URL"
```

## Post-Migration Verification

Run this query to verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('threads', 'thread_participants', 'messages');
```

You should see 3 rows returned.

## Testing the Fix

After migration is applied:
1. Backend will automatically work (no code changes needed)
2. Test sending a message from frontend
3. Verify message appears in thread
4. Check unread badge increments for recipient

## Rollback (if needed)

```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS thread_participants CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP FUNCTION IF EXISTS get_threads_for_user(UUID);
DROP FUNCTION IF EXISTS update_thread_timestamp();
DROP FUNCTION IF EXISTS increment_unread_count();
```
