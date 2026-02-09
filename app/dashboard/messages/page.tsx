'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth, useMessages } from '@/lib/store';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function BuyerMessagesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { threads, getThreadMessages, sendMessage, markAsRead } = useMessages();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threads[0]?.id || null);
  const [draft, setDraft] = useState('');

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const messages = useMemo(
    () => (activeThread ? getThreadMessages(activeThread.id) : []),
    [activeThread, getThreadMessages]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'buyer') {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 mb-4">
          <MessageSquare />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-2">Please log in as a buyer to view your messages.</p>
        <Link href="/login" className="mt-6 px-5 py-2.5 bg-black text-white rounded-xl font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-2">Messages</h1>
            <p className="text-gray-500 mt-1">
              Buyer-creator messaging is part of the product vision. This UI currently uses local mock data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-900">Threads</div>
            {threads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-3 opacity-50" />
                No conversations yet.
              </div>
            ) : (
              <div className="divide-y">
                {threads.map((t) => {
                  const isActive = t.id === activeThreadId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveThreadId(t.id);
                        markAsRead(t.id);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${isActive ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">Conversation</p>
                        {t.unreadCount > 0 && (
                          <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{t.lastMessage?.content || 'No messages yet'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col min-h-[520px]">
            <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-900">
              {activeThread ? 'Chat' : 'Select a thread'}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
              {activeThread ? (
                messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">No messages in this thread.</div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => {
                      const mine = m.senderId === user.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${mine ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-900'} max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            <p className={`${mine ? 'text-white/70' : 'text-gray-400'} text-[11px] mt-1`}>{new Date(m.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Pick a thread to start.
                </div>
              )}
            </div>

            <form
              className="p-4 border-t border-gray-100 bg-white"
              onSubmit={(e) => {
                e.preventDefault();
                if (!activeThread || !draft.trim()) return;
                sendMessage(activeThread.id, draft.trim(), user.id, user);
                setDraft('');
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={activeThread ? 'Write a message...' : 'Select a thread first'}
                  disabled={!activeThread}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={!activeThread || !draft.trim()}
                  className="px-5 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
