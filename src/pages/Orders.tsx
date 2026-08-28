import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { CompanyLogo, PageHeader, QueryStatus } from '../components/ui';
import { api } from '../api';
import type { OrderSide, OrderStatus } from '../api/types';
import { useApi } from '../hooks/useApi';
import { STATUS_LABEL } from '../lib/format';

const statusFilters: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Waiting' },
  { id: 'matched', label: 'Matched' },
  { id: 'holding', label: 'Held' },
  { id: 'completed', label: 'Done' },
  { id: 'cancelled', label: 'Cancelled' },
];

function statusClass(status: OrderStatus) {
  if (status === 'open') return 'border-primary-container/40 bg-primary-container/10 text-on-surface';
  if (status === 'matched' || status === 'holding') return 'border-accent/40 bg-accent/10 text-accent';
  if (status === 'completed') return 'border-bid/40 bg-bid/10 text-bid';
  return 'border-on-surface/15 bg-muted text-on-surface-variant';
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Orders() {
  const navigate = useNavigate();
  const [side, setSide] = useState<'all' | OrderSide>('all');
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');
  const { data, error, loading } = useApi(() => api.listOrders({ side, status, q: query }), [side, status, query]);
  const orders = data?.data ?? [];
  const openCount = data?.meta.openCount ?? orders.filter((o) => o.status === 'open' || o.status === 'matched' || o.status === 'holding').length;

  return (
    <div>
      <PageHeader
        title="Orders"
        description="See every buy and sell request you have placed. Open one to change, cancel, or track progress."
        actions={
          <button type="button" className="btn-primary" onClick={() => navigate('/place-order')}>
            <Plus size={16} aria-hidden="true" />
            New buy or sell
          </button>
        }
      />

      <p className="mb-4 text-sm text-on-surface-variant">
        {openCount} {openCount === 1 ? 'request is' : 'requests are'} still in progress
      </p>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative w-full lg:max-w-xs">
          <span className="sr-only">Search orders</span>
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} aria-hidden="true" />
          <input
            className="field pl-9"
            placeholder="Search company or order ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="flex rounded-lg bg-muted p-1" role="group" aria-label="Buy or sell">
          {(['all', 'BUY', 'SELL'] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={side === id}
              className={`min-h-9 flex-1 cursor-pointer rounded-md px-3 text-sm ${
                side === id ? 'bg-card font-medium' : 'text-on-surface-variant'
              }`}
              onClick={() => setSide(id)}
            >
              {id === 'all' ? 'All' : id === 'BUY' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={status === item.id}
            className={`min-h-9 cursor-pointer whitespace-nowrap rounded-lg px-3 text-sm ${
              status === item.id ? 'bg-primary-container text-on-primary-container' : 'bg-card text-on-surface-variant'
            }`}
            onClick={() => setStatus(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <QueryStatus loading={loading && !data} error={error}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Order', 'Company', 'Type', 'Shares', 'Price', 'You pay / receive', 'Status', 'Placed'].map((h) => (
                  <th key={h} className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b border-border/70 last:border-0 hover:bg-muted/40"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td className="px-3 py-3 font-mono text-xs">
                    <Link to={`/orders/${order.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2">
                      <CompanyLogo name={order.company} domain={order.domain} size="sm" />
                      <span>
                        <span className="block font-medium">{order.company}</span>
                        <span className="text-xs text-on-surface-variant">{order.ticker}</span>
                      </span>
                    </span>
                  </td>
                  <td className={`px-3 py-3 font-medium ${order.side === 'BUY' ? 'text-bid' : 'text-ask'}`}>
                    {order.side === 'BUY' ? 'Buy' : 'Sell'}
                  </td>
                  <td className="px-3 py-3 font-mono">{order.quantity.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 font-mono">₹{order.price.toFixed(2)}</td>
                  <td className="px-3 py-3 font-mono">₹{order.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs ${statusClass(order.status)}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-on-surface-variant">{formatWhen(order.placedAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-on-surface-variant">
                    No orders match these filters.{' '}
                    <button type="button" className="text-accent underline" onClick={() => navigate('/place-order')}>
                      Place a new one
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </QueryStatus>
    </div>
  );
}
