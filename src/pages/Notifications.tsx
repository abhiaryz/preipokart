import { Bell } from '@phosphor-icons/react';
import { PageHeader, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import { useApi } from '../hooks/useApi';

export default function Notifications() {
  const { data, error, loading, reload } = useApi(() => api.listNotifications(), []);
  const items = data?.data ?? [];

  const markOne = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await reload();
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
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Alerts"
        description="Order updates and reminders. Tap one to mark it as read."
        actions={
          <button type="button" className="btn-secondary" onClick={() => void markAll()}>
            Mark all as read
          </button>
        }
      />

      <QueryStatus loading={loading} error={error}>
        {items.length === 0 ? (
          <p className="card p-6 text-sm text-on-surface-variant">No alerts yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`card flex w-full cursor-pointer gap-3 p-4 text-left transition duration-200 hover:border-primary/40 ${
                    item.read ? 'opacity-70' : ''
                  }`}
                  onClick={() => void markOne(item.id)}
                >
                  <Bell size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="mt-1 block text-sm text-on-surface-variant">{item.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </QueryStatus>
    </div>
  );
}
