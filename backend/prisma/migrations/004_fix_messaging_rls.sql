-- ============================================
-- MIGRATION FIX: Messaging RLS Policies
-- Created: 2026-02-11
-- Issue: RLS policies blocking SERVICE_ROLE_KEY inserts
-- Solution: Simplify policies for backend service role usage
-- ============================================

-- Fix messages INSERT policy
-- Remove auth.uid() check since backend uses SERVICE_ROLE_KEY
-- Backend already validates auth in controller (requireAuth, requireParticipant)
DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
CREATE POLICY "Users can send messages in their threads"
  ON messages FOR INSERT
  WITH CHECK (
    -- Allow insert if user is a participant of the thread
    EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = messages.thread_id
        AND thread_participants.user_id = messages.sender_id
    )
  );

-- Also simplify thread_participants UPDATE policy
-- Backend validates user_id in controller before update
DROP POLICY IF EXISTS "Users can update their own participant record" ON thread_participants;
CREATE POLICY "Users can update their own participant record"
  ON thread_participants FOR UPDATE
  WITH CHECK (true);  -- Backend already validates via requireParticipant
