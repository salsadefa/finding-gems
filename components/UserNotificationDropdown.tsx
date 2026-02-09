'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ExternalLink, MessageSquare } from 'lucide-react';
import { useUserNotifications, useUserUnreadCount, useMarkAllUserNotificationsAsRead, useMarkUserNotificationAsRead } from '@/lib/api/user-notifications';
import { useAuth } from '@/lib/store';

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function getLink(n: { entityType?: string | null; entityId?: string | null; metadata?: Record<string, unknown> | null }) {
  if (n.entityType === 'tool_request' && n.entityId) return `/requests/${n.entityId}`;
  const reqId = n.metadata ? (n.metadata as Record<string, unknown>).requestId : undefined;
  if (typeof reqId === 'string' && reqId) return `/requests/${reqId}`;
  return null;
}

export default function UserNotificationDropdown() {
  const router = useRouter();
  const { user } = useAuth();
  const userIdForKey = user?.id;

  const { data: unreadCount } = useUserUnreadCount(userIdForKey);
  const { data } = useUserNotifications({ page: 1, limit: 10 }, userIdForKey);
  const markAll = useMarkAllUserNotificationsAsRead();
  const markOne = useMarkUserNotificationAsRead();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const notifications = data?.notifications || [];
  const hasUnread = (unreadCount || 0) > 0;

  const header = useMemo(() => {
    return {
      count: unreadCount || 0,
      title: hasUnread ? `Notifications (unread: ${unreadCount})` : 'Notifications',
    };
  }, [hasUnread, unreadCount]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">{header.title}</p>
            {hasUnread && (
              <button
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-900 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <MessageSquare className="w-6 h-6 mx-auto mb-3 opacity-50" />
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const link = getLink(n);
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markOne.mutate(n.id);
                      setOpen(false);
                      if (link) router.push(link);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      !n.isRead ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                      <Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                          {link && <ExternalLink size={14} className="text-gray-300" />}
                        </div>
                      </div>
                      {!n.isRead && <p className="text-xs text-indigo-600 mt-2 font-medium">Unread</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <Link href="/requests" className="text-sm font-semibold text-gray-900 hover:text-gray-600" onClick={() => setOpen(false)}>
              View Requests
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
