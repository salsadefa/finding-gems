/**
 * useRealtimeMessages Hook
 * 
 * Subscribes to real-time message updates from Supabase
 * Automatically updates React Query cache when new messages arrive
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { messageKeys, Message } from '../api/messages';
import { normalizeKeys } from '../api/normalize';

interface UseRealtimeMessagesOptions {
  threadId: string | null;
  enabled?: boolean;
}

export function useRealtimeMessages({ threadId, enabled = true }: UseRealtimeMessagesOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Don't subscribe if disabled or no threadId
    if (!enabled || !threadId) {
      return;
    }

    console.log('[Realtime] Subscribing to thread:', threadId);

    // Create unique channel name for this thread
    const channelName = `messages:${threadId}`;

    // Subscribe to INSERT events on messages table
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          console.log('[Realtime] New message received:', payload.new);

          // Normalize the message data
          const newMessage = normalizeKeys<Message>(payload.new);

          // Update messages cache with new message
          queryClient.setQueryData<Message[]>(
            messageKeys.threadMessages(threadId),
            (oldMessages = []) => {
              // Check if message already exists (prevent duplicates)
              const exists = oldMessages.some((m) => m.id === newMessage.id);
              if (exists) {
                console.log('[Realtime] Message already in cache, skipping');
                return oldMessages;
              }

              console.log('[Realtime] Adding new message to cache');
              return [...oldMessages, newMessage];
            }
          );

          // Invalidate threads list to update last message preview
          queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'thread_participants',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          console.log('[Realtime] Thread participant updated:', payload.new);
          
          // Invalidate threads list to update unread counts
          queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('[Realtime] Unsubscribing from thread:', threadId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [threadId, enabled, queryClient]);

  return {
    isSubscribed: !!channelRef.current,
  };
}
