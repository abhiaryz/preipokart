import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Lightning,
  MagnifyingGlass,
  Pause,
  Play,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react';
import { CompanyLogo } from '../components/ui';
import { stocks } from '../data/stocks';

const mockOrderBook = stocks
  .filter((s) => s.id !== 'STRIP')
  .map((s) => ({
    id: s.id,
    name: s.name,
    domain: s.domain,
    sector: s.sector,
    lastClearing: s.price,
    bestBid: s.price * 0.995,
    bestAsk: s.price * 1.008,
    status: s.change < 0 ? ('ILLIQUID' as const) : ('LIQUID' as const),
  }));

const chartPaths = {
  '1D': { path: 'M0,90 Q15,40 30,80 T60,20 T80,70 T100,30 L100,100 L0,100 Z', stroke: 'M0,90 Q15,40 30,80 T60,20 T80,70 T100,30', label: 'Price trend today' },
  '1W': { path: 'M0,80 Q10,70 20,75 T40,60 T60,80 T80,40 T100,50 L100,100 L0,100 Z', stroke: 'M0,80 Q10,70 20,75 T40,60 T60,80 T80,40 T100,50', label: 'Price trend this week' },
  '1M': { path: 'M0,75 Q20,60 40,85 T70,30 T90,40 T100,20 L100,100 L0,100 Z', stroke: 'M0,75 Q20,60 40,85 T70,30 T90,40 T100,20', label: 'Price trend this month' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M'>('1W');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoverIndex, setHoverIndex] = useState<{ x: number; y: number; val: number } | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [live, setLive] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your last buy request is being matched', read: false },
    { id: 2, text: 'Please finish your identity check', read: false },
  ]);
  const [bidVolume, setBidVolume] = useState(4.2);
  const [efficiency, setEfficiency] = useState(94.2);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setBidVolume((prev) => parseFloat((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
      setEfficiency((prev) => {
        const val = parseFloat((prev + (Math.random() - 0.5) * 0.2).toFixed(1));
        return Math.max(90, Math.min(99.9, val));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [live]);

  const filteredOrderBook = mockOrderBook.filter(
    (row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {notifications.some((n) => !n.read) && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
              )}
            </button>
            {notificationsOpen && (
              <div className="card absolute right-0 z-20 mt-2 w-72 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Notifications</p>
                  <button
                    type="button"
                    className="text-xs text-accent hover:underline"
                    onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
                  >
                    Mark all read
                  </button>
                </div>
                <ul className="space-y-1">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={`w-full cursor-pointer rounded-lg p-2 text-left text-xs transition duration-200 ${
                          n.read ? 'text-muted-foreground hover:bg-muted' : 'bg-muted text-foreground'
                        }`}
                        onClick={() =>
                          setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                        }
                      >
                        {n.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="card flex items-start gap-3 p-4">
        <span className="rounded-lg bg-muted p-2 text-accent">
          <Lightning size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Today’s takeaway</h2>
          <p className="mt-1 text-sm leading-relaxed">
            <strong>Tech companies are in demand.</strong> More people are trying to buy AI and hardware names, so prices
            may stay firm this week.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <section className="card col-span-1 flex min-h-[360px] flex-col p-4 md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {chartPaths[chartRange].label}
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
              const val = parseFloat((135 + (y / rect.height) * 20 + (x / rect.width) * 10).toFixed(2));
              setHoverIndex({ x, y, val });
            }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
              <path d={chartPaths[chartRange].path} fill="url(#grad1)" opacity="0.25" />
              <path d={chartPaths[chartRange].stroke} fill="none" stroke="rgb(var(--color-primary-container))" strokeWidth="0.8" />
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
                <p className="font-mono">Index {hoverIndex.val}</p>
                <p className="text-muted-foreground">Vol {(hoverIndex.val * 0.01).toFixed(2)}%</p>
              </div>
            )}
          </div>
        </section>

        <div className="col-span-1 flex flex-col gap-4 md:col-span-4">
          <section className="card flex flex-1 flex-col justify-between p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Money waiting to buy</h2>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-mono text-3xl font-semibold">${bidVolume}B</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 font-mono text-xs text-accent">
                <TrendUp size={14} aria-hidden="true" />
                +12.5%
              </span>
            </div>
          </section>
          <section className="card flex flex-1 flex-col justify-between p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Deals completed on time</h2>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-mono text-3xl font-semibold">{efficiency}%</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-1 font-mono text-xs text-ask">
                <TrendDown size={14} aria-hidden="true" />
                −1.2%
              </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${efficiency}%` }} />
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
              {filteredOrderBook.map((row) => (
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
                  <td className="px-3 py-3 font-mono">₹{row.lastClearing.toFixed(2)}</td>
                  <td className="px-3 py-3 font-mono text-bid">Buy ₹{row.bestBid.toFixed(2)}</td>
                  <td className="px-3 py-3 font-mono text-ask">Sell ₹{row.bestAsk.toFixed(2)}</td>
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
              {filteredOrderBook.length === 0 && (
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
    </div>
  );
}
