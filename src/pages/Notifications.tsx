import { useState } from 'react';
import { Bell } from '@phosphor-icons/react';
import { PageHeader } from '../components/ui';

const initial = [
  { id: 1, title: 'Your Swiggy buy request is in progress', body: 'We are matching you with a seller. This usually takes 1–2 working days.', read: false },
  { id: 2, title: 'Please finish identity check', body: 'Add your PAN so you can place larger orders.', read: false },
  { id: 3, title: 'Price update: Ola Electric', body: 'Last traded price moved up 8.5% this week.', read: true },
];

export default function Notifications() {
  const [items, setItems] = useState(initial);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Alerts"
        description="Order updates and reminders. Tap one to mark it as read."
        actions={
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setItems((list) => list.map((i) => ({ ...i, read: true })))}
          >
            Mark all as read
          </button>
        }
      />

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`card flex w-full cursor-pointer gap-3 p-4 text-left transition duration-200 hover:border-primary/40 ${
                item.read ? 'opacity-70' : ''
              }`}
              onClick={() => setItems((list) => list.map((i) => (i.id === item.id ? { ...i, read: true } : i)))}
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
    </div>
  );
}
