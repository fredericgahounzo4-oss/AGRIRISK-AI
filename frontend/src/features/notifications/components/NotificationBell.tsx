import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
import { timeAgo } from '@/utils/formatDate';
import type { Notification } from '../types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const notifications = data?.results ?? [];
  const unreadCount = data?.unread_count ?? 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) markAsRead.mutate(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="flex items-center gap-1 text-xs text-[#1a5c2a] hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune notification pour l'instant.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    !n.is_read ? 'bg-[#e8f5e9]/40' : ''
                  }`}
                >
                  <span className="text-xl shrink-0">{n.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-[#22c55e] shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
