/**
 * useRealtimeThreads Hook
 * 
 * Subscribes to real-time updates for message threads
 * Updates when new threads are created or thread metadata changes
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, checkSupabaseConfig } from '../supabase';
import { messageKeys } from '../api/messages';

interface UseRealtimeThreadsOptions {
  userId: string | null;
  enabled?: boolean;
}

export function useRealtimeThreads({ userId, enabled = true }: UseRealtimeThreadsOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // Check if Supabase is configured
    if (!checkSupabaseConfig()) {
      console.warn('[Realtime] Supabase not configured, skipping subscription');
      return;
    }

    console.log('[Realtime] Subscribing to thread updates for user:', userId);

    const channel = supabase
      .channel(`threads:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threads',
        },
        (payload) => {
          console.log('[Realtime] New thread created:', payload.new);
          
          // Invalidate threads query to refetch with new thread
          queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'threads',
        },
        (payload) => {
          console.log('[Realtime] Thread updated:', payload.new);
          
          // Invalidate threads query to get updated metadata
          queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Thread subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[Realtime] Unsubscribing from thread updates');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, enabled, queryClient]);

  return {
    isSubscribed: !!channelRef.current,
  };
}
