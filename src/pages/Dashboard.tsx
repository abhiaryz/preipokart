import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChartBar,
  ChartLineUp,
  Lightning,
  MagnifyingGlass,
  ShieldCheck,
  TrendUp,
  Vault,
  Package,
} from '@phosphor-icons/react';
import { CompanyLogo, QueryStatus } from '../components/ui';
import { api } from '../api';
import type { ChartPoint } from '../api/types';
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
  const [filterQuery, setFilterQuery] = useState('');
  const [hoverIndex, setHoverIndex] = useState<{ x: number; y: number; val: number } | null>(null);

  const overview = useApi(() => api.getOverview(), []);
  const book = overview.data?.book ?? [];
  const chartId = book[0]?.id;
  const chart = useApi(
    () => api.getStockChart(chartId!, chartRange),
    [chartId, chartRange],
    Boolean(chartId),
  );

  const paths = useMemo(() => chartPath(chart.data?.points ?? []), [chart.data?.points]);

  const filteredBook = useMemo(() => {
    if (!filterQuery.trim()) return book;
    const q = filterQuery.toLowerCase();
    return book.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.sector.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  }, [book, filterQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-emerald-950 via-[#0F4A3D] to-slate-900 p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Live Pre-IPO Trading Desk
            </span>
          </div>
          <h1 className="mt-1 font-headline-sm text-2xl font-bold tracking-tight text-white md:text-3xl">
            Pre-IPO Market Overview
          </h1>
          <p className="mt-1 max-w-xl text-sm text-emerald-100/80">
            Real-time clearing depth, matching bids, and indicative unlisted valuations backed by depository transfer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/explore/screener')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-400 px-4 text-xs font-semibold text-[#0F4A3D] shadow-sm transition-colors hover:bg-emerald-300"
          >
            <ChartBar size={16} />
            Market Screener
          </button>
        </div>
      </div>

      <QueryStatus loading={overview.loading && !overview.data} error={overview.error}>
        {/* KPI Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Buyer Liquidity
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#0F4A3D]">
                <TrendUp size={16} />
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-slate-900">
              ₹{overview.data?.bidVolumeCr ?? 0} Cr
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Active open buy capital waiting to match
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Match Efficiency
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <ChartLineUp size={16} />
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-slate-900">
              {overview.data?.matchEfficiencyPct ?? 0}%
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0F4A3D] transition-all duration-500"
                style={{ width: `${overview.data?.matchEfficiencyPct ?? 0}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Active Listings
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Package size={16} />
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-slate-900">
              {book.length} Companies
            </p>
            <p className="mt-1 text-xs text-slate-500">
              High-growth unlisted & pre-IPO enterprises
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Depository Escrow
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <ShieldCheck size={16} />
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-slate-900">
              100% CDSL / NSDL
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Guaranteed escrow share allocation
            </p>
          </div>
        </div>

        {/* Market Takeaway Insight */}
        {overview.data?.takeaway && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-[#0F4A3D]">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F4A3D] text-white">
              <Lightning size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0F4A3D]/70">
                Desk Takeaway & Liquidity Note
              </h2>
              <p className="mt-0.5 text-sm font-medium leading-relaxed text-slate-800">
                {overview.data.takeaway}
              </p>
            </div>
          </div>
        )}

        {/* Main Grid: Price Chart & Shortcuts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Chart Section */}
          <section className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Indicative Price Trend · {book[0]?.name ?? 'Unlisted Market'}
                </h2>
                <p className="text-sm font-medium text-slate-800">
                  Recent matched order benchmarks
                </p>
              </div>

              <div className="flex gap-1" role="group" aria-label="Chart range">
                {(['1D', '1W', '1M'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    aria-pressed={chartRange === range}
                    onClick={() => setChartRange(range)}
                    className={`rounded-md px-3 py-1 font-mono text-xs font-semibold transition-colors ${
                      chartRange === range
                        ? 'bg-[#0F4A3D] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50"
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
                <path d={paths.path} fill="url(#dash-grad)" opacity="0.3" />
                <path d={paths.stroke} fill="none" stroke="#0F4A3D" strokeWidth="1.2" />
                <defs>
                  <linearGradient id="dash-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {hoverIndex && (
                <div
                  className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-md text-xs font-mono font-semibold"
                  style={{ left: Math.min(hoverIndex.x + 12, 220), top: Math.max(hoverIndex.y - 48, 8) }}
                >
                  ₹{hoverIndex.val.toFixed(2)}
                </div>
              )}
            </div>
          </section>

          {/* Quick Workflows Column */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">Quick Access</h3>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => navigate('/portfolio')}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F4A3D]">
                      <Vault size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Your Portfolio</p>
                      <p className="text-[11px] text-slate-500">Holdings & unrealized P&L</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Package size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Orders Desk</p>
                      <p className="text-[11px] text-slate-500">Track execution & settlements</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/explore/screener')}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <ChartBar size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Asset Screener</p>
                      <p className="text-[11px] text-slate-500">Compare financial metrics</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/30 p-5">
              <h4 className="text-xs font-semibold text-[#0F4A3D]">Need Trading Assistance?</h4>
              <p className="mt-1 text-xs text-slate-600">
                Our institutional matching desk assists with bulk lot acquisitions and off-market block settlements.
              </p>
              <button
                type="button"
                onClick={() => navigate('/support')}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4A3D] hover:underline"
              >
                Contact Trade Desk
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Live Order Book & Trading Depth */}
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-12">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Live Trading Depth
                </h2>
                <p className="text-sm font-medium text-slate-800">
                  Pre-IPO companies actively quoting on platform
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter companies…"
                    className="h-9 w-48 rounded-lg border border-slate-200 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0F4A3D] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/explore/screener')}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Open screener
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Company', 'Sector', 'Last Clearing', 'Best Buyer Bid', 'Best Seller Ask', 'Market Liquidity', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBook.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                      onClick={() => navigate(`/stocks/${row.id}`)}
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo name={row.name} domain={row.domain} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900">{row.name}</p>
                            <p className="font-mono text-[10px] text-slate-400">{row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-slate-500">{row.sector}</td>
                      <td className="px-3 py-3.5 font-mono font-medium text-slate-800">
                        ₹{(row.lastClearing ?? 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-3.5 font-mono font-semibold text-emerald-700">
                        {row.bestBid != null ? `₹${row.bestBid.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-3 py-3.5 font-mono font-semibold text-rose-700">
                        {row.bestAsk != null ? `₹${row.bestAsk.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            row.status === 'LIQUID'
                              ? 'bg-emerald-50 text-[#0F4A3D] border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {row.status === 'LIQUID' ? 'Active Liquidity' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/stocks/${row.id}`);
                          }}
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#0F4A3D] hover:text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBook.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-xs text-slate-400">
                        No companies match your filter query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </QueryStatus>
    </div>
  );
}
