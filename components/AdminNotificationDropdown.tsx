'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, getNotificationIcon, getNotificationColor, getNotificationLink, AdminNotification } from '@/lib/api/admin-notifications';

export default function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: unread = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useAdminNotifications({ limit: 10 });
  const items = data?.notifications || [];
  const markOne = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const click = (n: AdminNotification) => {
    if (!n.isRead) markOne.mutate(n.id);
    const link = getNotificationLink(n);
    if (link) { router.push(link); setIsOpen(false); }
  };

  const time = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'Baru'; if (m < 60) return `${m}m`; if (m < 1440) return `${Math.floor(m/60)}j`; return `${Math.floor(m/1440)}h`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-lg hover:bg-gray-100">
        <Bell size={20} />
        {unread > 0 && <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="text-base font-semibold">Notifikasi</h3>
            {unread > 0 && <button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"><CheckCheck size={14}/><span>Tandai dibaca</span></button>}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? <div className="p-10 text-center text-gray-500">Memuat...</div> : items.length === 0 ? <div className="p-10 text-center text-gray-500"><Bell size={32}/><p>Tidak ada notifikasi</p></div> : items.map(n => (
              <button key={n.id} onClick={() => click(n)} className={`flex items-start gap-3 w-full p-3.5 border-b text-left hover:bg-gray-50 ${!n.isRead ? 'bg-indigo-50' : ''}`}>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${getNotificationColor(n.type)}`}>{getNotificationIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{n.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                  <span className="text-[11px] text-gray-400">{time(n.createdAt)}</span>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5"/>}
              </button>
            ))}
          </div>
          {items.length > 0 && <div className="p-3 border-t bg-gray-50"><button onClick={() => { router.push('/admin?tab=notifications'); setIsOpen(false); }} className="flex items-center justify-center gap-1.5 w-full p-2.5 text-sm font-medium text-indigo-600 bg-white border rounded-lg hover:bg-indigo-50">Lihat semua<ExternalLink size={14}/></button></div>}
        </div>
      )}
    </div>
  );
}
