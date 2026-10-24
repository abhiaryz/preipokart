import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from '@phosphor-icons/react';
import { api, errorMessage } from '../api';
import { useApi } from '../hooks/useApi';

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HeaderAlertsDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, loading, reload } = useApi(() => api.listNotifications(), []);
  const items = data?.data ?? [];
  const unreadCount = items.filter((item) => !item.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) void reload();
  }, [open, reload]);

  const markOne = async (id: string, href?: string | null) => {
    try {
      await api.markNotificationRead(id);
      await reload();
      if (href) {
        setOpen(false);
        navigate(href);
      }
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      await reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        className="header-icon-btn"
        aria-label="Alerts"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Alerts"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={16} />
        {unreadCount > 0 ? <span className="dot" aria-hidden="true" /> : null}
        {unreadCount > 0 ? (
          <span className="sr-only">{unreadCount} unread alerts</span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          role="dialog"
          aria-label="Alerts"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Alerts</p>
              <p className="text-xs text-slate-500">Order updates and reminders</p>
            </div>
            {items.length > 0 ? (
              <button type="button" className="text-xs font-medium text-[#0f4a3d] hover:underline" onClick={() => void markAll()}>
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">Loading alerts…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">No alerts yet.</p>
            ) : (
              <ul className="space-y-1">
                {items.slice(0, 12).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`flex w-full gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50 ${
                        item.read ? 'opacity-75' : 'bg-emerald-50/40'
                      }`}
                      onClick={() => void markOne(item.id, item.href)}
                    >
                      <Bell size={18} className="mt-0.5 shrink-0 text-[#0f4a3d]" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-900">{item.title}</span>
                        <span className="mt-0.5 block line-clamp-2 text-xs text-slate-600">{item.body}</span>
                        {item.createdAt ? (
                          <span className="mt-1 block text-[10px] text-slate-400">{formatWhen(item.createdAt)}</span>
                        ) : null}
                      </span>
                      {!item.read ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0f4a3d]" aria-hidden="true" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to="/notifications"
              className="block text-center text-xs font-medium text-[#0f4a3d] hover:underline"
              onClick={() => setOpen(false)}
            >
              View all alerts
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
