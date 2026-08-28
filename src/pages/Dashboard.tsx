import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Lightning,
  MagnifyingGlass,
  Pause,
  Play,
  TrendUp,
} from '@phosphor-icons/react';
import { CompanyLogo, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import type { ChartPoint, Notification } from '../api/types';
import { useApi } from '../hooks/useApi';

function chartPath(points: ChartPoint[]) {
  if (!points.length) return { path: '', stroke: '' };
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.12 || 1;
  const yMin = min - pad;
  const yMax = max + pad;
  const coords = points.map((pt, i) => {
    const x = points.length === 1 ? 0 : (i / (points.length - 1)) * 100;
    const y = yMax === yMin ? 50 : ((yMax - pt.price) / (yMax - yMin)) * 90 + 5;
    return { x, y };
  });
  const stroke = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
  const path = `${stroke} L100,100 L0,100 Z`;
  return { path, stroke };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M'>('1W');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoverIndex, setHoverIndex] = useState<{ x: number; y: number; val: number } | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [live, setLive] = useState(true);

  const overview = useApi(() => api.getOverview(searchQuery || undefined), [searchQuery]);
  const notifications = useApi(() => api.listNotifications(), []);
  const book = overview.data?.book ?? [];
  const chartId = book[0]?.id;
  const chart = useApi(
    () => api.getStockChart(chartId!, chartRange),
    [chartId, chartRange],
    Boolean(chartId),
  );

  useEffect(() => {
    if (!live) return undefined;
    const interval = window.setInterval(() => {
      void overview.reload();
    }, 4000);
    return () => window.clearInterval(interval);
  }, [live, overview.reload]);

  const paths = useMemo(() => chartPath(chart.data?.points ?? []), [chart.data?.points]);
  const items: Notification[] = notifications.data?.data ?? [];

  const markRead = async (id?: string) => {
    try {
      if (id) await api.markNotificationRead(id);
      else await api.markAllNotificationsRead();
      await notifications.reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            See how pre-IPO companies are trading today. Pause updates if the numbers move too fast.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search markets</span>
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              className="field w-full pl-9 md:w-56"
              placeholder="Search markets"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-secondary min-h-11"
            aria-pressed={live}
            onClick={() => setLive((v) => !v)}
          >
            {live ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {live ? 'Pause live prices' : 'Resume live prices'}
          </button>
          <div className="relative">
            <button
              type="button"
              className="btn-ghost min-h-11 min-w-11"
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((v) => !v)}
            >
              <Bell size={18} aria-hidden="true" />
              {items.some((n) => !n.read) && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
              )}
            </button>
            {notificationsOpen && (
              <div className="card absolute right-0 z-20 mt-2 w-72 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Notifications</p>
                  <button type="button" className="text-xs text-accent hover:underline" onClick={() => void markRead()}>
                    Mark all read
                  </button>
                </div>
                <ul className="space-y-1">
                  {items.length === 0 ? (
                    <li className="p-2 text-xs text-muted-foreground">No alerts yet.</li>
                  ) : (
                    items.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`w-full cursor-pointer rounded-lg p-2 text-left text-xs transition duration-200 ${
                            n.read ? 'text-muted-foreground hover:bg-muted' : 'bg-muted text-foreground'
                          }`}
                          onClick={() => {
                            void markRead(n.id);
                            if (n.href) navigate(n.href);
                          }}
                        >
                          {n.title}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <QueryStatus loading={overview.loading && !overview.data} error={overview.error}>
        <section className="card flex items-start gap-3 p-4">
          <span className="rounded-lg bg-muted p-2 text-accent">
            <Lightning size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Today’s takeaway</h2>
            <p className="mt-1 text-sm leading-relaxed">{overview.data?.takeaway}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <section className="card col-span-1 flex min-h-[360px] flex-col p-4 md:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Price trend · {book[0]?.name ?? 'Market'}
              </h2>
              <div className="flex gap-1" role="group" aria-label="Chart range">
                {(['1D', '1W', '1M'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    aria-pressed={chartRange === range}
                    onClick={() => setChartRange(range)}
                    className={`cursor-pointer rounded-md px-2.5 py-1 font-mono text-[10px] uppercase transition duration-200 ${
                      chartRange === range ? 'bg-accent text-on-accent' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="relative flex-1 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-low"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const points = chart.data?.points ?? [];
                const index = points.length
                  ? Math.min(points.length - 1, Math.max(0, Math.round((x / rect.width) * (points.length - 1))))
                  : 0;
                const val = points[index]?.price ?? 0;
                setHoverIndex({ x, y, val });
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
                <path d={paths.path} fill="url(#grad1)" opacity="0.25" />
                <path d={paths.stroke} fill="none" stroke="rgb(var(--color-primary-container))" strokeWidth="0.8" />
                <defs>
                  <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(var(--color-primary-container))" stopOpacity="1" />
                    <stop offset="100%" stopColor="rgb(var(--color-canvas))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {hoverIndex && (
                <div
                  className="card pointer-events-none absolute z-10 p-2 text-xs"
                  style={{ left: Math.min(hoverIndex.x + 12, 220), top: Math.max(hoverIndex.y - 48, 8) }}
                >
                  <p className="font-mono">₹{hoverIndex.val.toFixed(2)}</p>
                </div>
              )}
            </div>
          </section>

          <div className="col-span-1 flex flex-col gap-4 md:col-span-4">
            <section className="card flex flex-1 flex-col justify-between p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Money waiting to buy</h2>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-mono text-3xl font-semibold">₹{overview.data?.bidVolumeCr ?? 0} Cr</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 font-mono text-xs text-accent">
                  <TrendUp size={14} aria-hidden="true" />
                  Live
                </span>
              </div>
            </section>
            <section className="card flex flex-1 flex-col justify-between p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Deals completed on time</h2>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-mono text-3xl font-semibold">{overview.data?.matchEfficiencyPct ?? 0}%</p>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${overview.data?.matchEfficiencyPct ?? 0}%` }}
                />
              </div>
            </section>
          </div>

          <section className="card col-span-1 overflow-x-auto p-4 md:col-span-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Companies people are trading now
              </h2>
              <button type="button" className="btn-ghost text-accent" onClick={() => navigate('/explore')}>
                View companies
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Company', 'Sector', 'Last price', 'Buyers offer', 'Sellers ask', 'Easy to trade?'].map((h) => (
                    <th key={h} className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {book.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-border/60 transition duration-150 hover:bg-muted/50"
                    onClick={() => navigate(`/stocks/${row.id}`)}
                  >
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2">
                        <CompanyLogo name={row.name} domain={row.domain} size="sm" />
                        <span className="font-medium">{row.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{row.sector}</td>
                    <td className="px-3 py-3 font-mono">₹{(row.lastClearing ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-3 font-mono text-bid">
                      {row.bestBid != null ? `Buy ₹${row.bestBid.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-ask">
                      {row.bestAsk != null ? `Sell ₹${row.bestAsk.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] ${
                          row.status === 'LIQUID'
                            ? 'border-accent/40 bg-accent/10 text-accent'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {row.status === 'LIQUID' ? 'Yes, active' : 'Slow'}
                      </span>
                    </td>
                  </tr>
                ))}
                {book.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      No companies match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </QueryStatus>
    </div>
  );
}
