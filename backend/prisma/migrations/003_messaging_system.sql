-- ============================================
-- MIGRATION: Messaging System
-- Created: 2026-02-10
-- Description: Add threads, thread_participants, messages tables
-- ============================================

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  request_id UUID REFERENCES tool_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_website_id ON threads(website_id);
CREATE INDEX IF NOT EXISTS idx_threads_request_id ON threads(request_id);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC);

-- Create thread_participants table
CREATE TABLE IF NOT EXISTS thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_unread ON thread_participants(user_id, unread_count) WHERE unread_count > 0;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(thread_id, is_read) WHERE is_read = FALSE;

-- Create trigger to update threads.updated_at when message is sent
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads 
  SET updated_at = NEW.created_at 
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_thread_timestamp ON messages;
CREATE TRIGGER trigger_update_thread_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_timestamp();

-- Create trigger to increment unread_count for other participants
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE thread_participants
  SET unread_count = unread_count + 1
  WHERE thread_id = NEW.thread_id 
    AND user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_unread_count ON messages;
CREATE TRIGGER trigger_increment_unread_count
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- Create RPC function to get threads for user
CREATE OR REPLACE FUNCTION get_threads_for_user(p_user_id UUID)
RETURNS TABLE (
  thread_id UUID,
  website_id UUID,
  request_id UUID,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  last_message_sender_id UUID,
  unread_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS thread_id,
    t.website_id,
    t.request_id,
    t.updated_at,
    m_last.created_at AS last_message_at,
    m_last.content AS last_message_preview,
    m_last.sender_id AS last_message_sender_id,
    COALESCE(tp.unread_count, 0)::INTEGER AS unread_count
  FROM threads t
  INNER JOIN thread_participants tp ON tp.thread_id = t.id
  LEFT JOIN LATERAL (
    SELECT created_at, content, sender_id
    FROM messages
    WHERE thread_id = t.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m_last ON TRUE
  WHERE tp.user_id = p_user_id
  ORDER BY COALESCE(m_last.created_at, t.updated_at) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable Row Level Security
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threads
DROP POLICY IF EXISTS "Users can view threads they participate in" ON threads;
CREATE POLICY "Users can view threads they participate in"
  ON threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = threads.id
        AND thread_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create threads" ON threads;
CREATE POLICY "Users can create threads"
  ON threads FOR INSERT
  WITH CHECK (true);

-- RLS Policies for thread_participants
DROP POLICY IF EXISTS "Users can view participants of their threads" ON thread_participants;
CREATE POLICY "Users can view participants of their threads"
  ON thread_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thread_participants tp2
      WHERE tp2.thread_id = thread_participants.thread_id
        AND tp2.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert thread participants" ON thread_participants;
CREATE POLICY "Users can insert thread participants"
  ON thread_participants FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own participant record" ON thread_participants;
CREATE POLICY "Users can update their own participant record"
  ON thread_participants FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for messages
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
CREATE POLICY "Users can view messages in their threads"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = messages.thread_id
        AND thread_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
CREATE POLICY "Users can send messages in their threads"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = messages.thread_id
        AND thread_participants.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON threads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON thread_participants TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;
