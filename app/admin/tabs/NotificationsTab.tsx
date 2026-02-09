'use client';

import { useMemo, useState } from 'react';
import {
  useAdminNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  getNotificationIcon,
  getNotificationLink,
  type AdminNotification,
} from '@/lib/api/admin-notifications';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

function timeAgo(date: string) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export default function NotificationsTab() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 20;

  const { data, isLoading, error } = useAdminNotifications({ page, limit, unreadOnly });
  const markOne = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();
  const items = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const canPrev = (data?.pagination?.hasPrev ?? page > 1) && page > 1;
  const canNext = data?.pagination?.hasNext ?? (items.length === limit);

  const title = useMemo(() => {
    if (unreadOnly) return `Notifications (unread${unreadCount ? `: ${unreadCount}` : ''})`;
    return `Notifications${unreadCount ? ` (unread: ${unreadCount})` : ''}`;
  }, [unreadOnly, unreadCount]);

  const open = (n: AdminNotification) => {
    if (!n.isRead) markOne.mutate(n.id);
    const link = getNotificationLink(n);
    if (link) router.push(link);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">System events and moderation alerts for admins.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded border-gray-300"
            />
            Unread only
          </label>
          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-600 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500">Loading notifications...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600">Failed to load notifications. Please try again.</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-700">
            <Bell />
          </div>
          No notifications.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-4 ${
                !n.isRead ? 'bg-indigo-50/50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg flex-shrink-0">
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                    {getNotificationLink(n) && <ExternalLink size={16} className="text-gray-300" />}
                  </div>
                </div>
                {!n.isRead && <p className="text-xs text-indigo-600 mt-2 font-medium">Unread</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext}
            className="px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
