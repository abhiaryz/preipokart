import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, TrendDown, TrendUp, ChartPieSlice } from '@phosphor-icons/react';
import { CompanyLogo, QueryStatus } from '../components/ui';
import { api } from '../api';
import type { ChartRange, StockDetail as StockDetailType } from '../api/types';
import { loginPath, useAuth } from '../auth';
import { useApi } from '../hooks/useApi';

function formatCr(n: number) {
  const sign = n < 0 ? '−' : '';
  return `${sign}₹${Math.abs(n).toLocaleString('en-IN')} Cr`;
}

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PriceChart({ stock }: { stock: StockDetailType }) {
  const [range, setRange] = useState<ChartRange>('1M');
  const [hover, setHover] = useState<{ x: number; y: number; price: number; index: number } | null>(null);
  const { data } = useApi(() => api.getStockChart(stock.id, range), [stock.id, range]);
  const series = data?.points ?? [];

  const min = series.length ? Math.min(...series.map((p) => p.price)) : stock.price;
  const max = series.length ? Math.max(...series.map((p) => p.price)) : stock.price;
  const pad = (max - min) * 0.12 || stock.price * 0.02;
  const yMin = min - pad;
  const yMax = max + pad;
  const w = 100;
  const h = 56;
  const last = series[series.length - 1];
  const first = series[0];
  const up = last && first ? last.price >= first.price : stock.change >= 0;

  const coords = series.map((pt, i) => {
    const x = series.length === 1 ? 0 : (i / (series.length - 1)) * w;
    const y = yMax === yMin ? h / 2 : ((yMax - pt.price) / (yMax - yMin)) * h;
    return { x, y, price: pt.price };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
  const area = coords.length ? `${line} L${w},${h} L0,${h} Z` : '';
  const stroke = up ? 'rgb(var(--color-bid))' : 'rgb(var(--color-ask))';
  const avg = series.length ? series.reduce((s, p) => s + p.price, 0) / series.length : stock.price;
  const rangeChange = first && last ? ((last.price - first.price) / first.price) * 100 : stock.change;

  return (
    <section className="elevation-widget rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-sm text-xl text-on-surface">Price chart</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Last-traded path. Not an exchange quote.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`font-mono text-sm ${up ? 'text-bid' : 'text-error'}`}>
            {rangeChange >= 0 ? '+' : ''}
            {rangeChange.toFixed(2)}% this {range === '1D' ? 'day' : range === '1W' ? 'week' : range === '1M' ? 'month' : 'year'}
          </span>
          <div className="flex gap-1" role="group" aria-label="Chart range">
            {(['1D', '1W', '1M', '1Y'] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => {
                  setRange(r);
                  setHover(null);
                }}
                className={`min-h-9 rounded-lg px-3 font-label-caps text-[11px] uppercase ${
                  range === r
                    ? 'bg-[#0F4A3D] text-white'
                    : 'text-on-surface-variant hover:bg-on-surface/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative mt-5 h-56 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-low"
        onMouseMove={(e) => {
          if (!coords.length) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const xPct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
          const index = Math.round(xPct * (coords.length - 1));
          const pt = coords[index];
          setHover({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            price: pt.price,
            index,
          });
        }}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`${stock.name} price over ${range}`}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={w}
              y1={h * g}
              y2={h * g}
              stroke="rgb(var(--color-outline-variant))"
              strokeOpacity="0.45"
              strokeWidth="0.15"
            />
          ))}
          <defs>
            <linearGradient id={`priceFill-${stock.id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          {area ? <path d={area} fill={`url(#priceFill-${stock.id})`} /> : null}
          {line ? <path d={line} fill="none" stroke={stroke} strokeWidth="0.7" vectorEffect="non-scaling-stroke" /> : null}
          {hover && coords[hover.index] ? (
            <>
              <line
                x1={coords[hover.index].x}
                x2={coords[hover.index].x}
                y1="0"
                y2={h}
                stroke="rgb(var(--color-on-surface))"
                strokeOpacity="0.35"
                strokeWidth="0.2"
              />
              <circle
                cx={coords[hover.index].x}
                cy={coords[hover.index].y}
                r="0.9"
                fill={stroke}
                stroke="rgb(var(--color-surface))"
                strokeWidth="0.35"
              />
            </>
          ) : null}
        </svg>
        {hover ? (
          <div
            className="elevation-widget pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-xs"
            style={{
              left: Math.min(Math.max(hover.x - 56, 8), 220),
              top: Math.max(hover.y - 56, 8),
            }}
          >
            <p className="font-mono font-semibold">{formatInr(hover.price)}</p>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-y-3 right-3 flex flex-col justify-between text-right font-mono text-[10px] text-on-surface-variant">
          <span>{formatInr(yMax)}</span>
          <span>{formatInr((yMax + yMin) / 2)}</span>
          <span>{formatInr(yMin)}</span>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-on-surface-variant">
        Last {formatInr(stock.price)} · Average {formatInr(avg)} · Range {formatInr(min)} – {formatInr(max)}
      </p>
    </section>
  );
}

export default function StockDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stock, error, loading } = useApi(() => api.getStock(id!), [id], Boolean(id));
  const [yearIndex, setYearIndex] = useState(0);
  const [shYearIndex, setShYearIndex] = useState(0);
  const [statementTab, setStatementTab] = useState<'income' | 'balance_sheet' | 'cash_flow'>('income');

  const years = stock?.financials ?? [];
  const selected = years[yearIndex] ?? years[0];
  const maxAbsRevenue = useMemo(() => Math.max(...years.map((y) => Math.abs(y.revenueCr)), 1), [years]);

  const shareholdings = stock?.shareholdings ?? [];
  const selectedSh = shareholdings[shYearIndex] ?? shareholdings[0];

  if (!id || (!loading && (error || !stock))) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <QueryStatus loading={loading || !stock} error={null}>
      {stock ? (
        <div className="flex flex-col gap-6">
          <div>
            <Link
              to="/explore"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Companies
            </Link>
          </div>

          <header className="elevation-widget flex flex-col gap-6 rounded-xl p-6 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <CompanyLogo name={stock.name} domain={stock.domain} size="lg" />
              <div className="min-w-0">
                <h1 className="font-headline-md text-[28px] tracking-tight text-on-surface">{stock.name}</h1>
                <p className="mt-1 font-body-md text-on-surface-variant">{stock.legalName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-outline-variant/50 bg-surface-container px-2 py-0.5 font-mono text-xs">
                    {stock.ticker}
                  </span>
                  <span className="font-label-caps text-[11px] uppercase text-on-surface-variant">{stock.sector}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 font-label-caps text-label-caps ${
                      stock.change >= 0
                        ? 'bg-secondary-container/10 text-secondary-container'
                        : 'bg-error-container/25 text-error'
                    }`}
                  >
                    {stock.change >= 0 ? <TrendUp size={14} aria-hidden="true" /> : <TrendDown size={14} aria-hidden="true" />}
                    {Math.abs(stock.change)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 md:text-right">
              <p className="font-data-lg text-data-lg text-on-surface">₹{stock.price.toLocaleString('en-IN')}</p>
              <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Last traded</p>
              <p className="mt-2 text-sm text-on-surface-variant">Implied value {stock.impliedVal}</p>
              <button
                type="button"
                className="btn-primary mt-4 min-h-11"
                onClick={() => {
                  const orderPath = `/place-order?asset=${stock.id}`;
                  navigate(user ? orderPath : loginPath(orderPath));
                }}
              >
                Place a buy or sell
              </button>
            </div>
          </header>

          <PriceChart key={stock.id} stock={stock} />

          {stock.description ? (
            <section className="elevation-widget rounded-xl p-6">
              <h2 className="font-headline-sm text-xl text-on-surface">Description</h2>
              <p className="mt-3 max-w-[70ch] font-body-md leading-relaxed text-on-surface-variant">{stock.description}</p>
            </section>
          ) : null}

          <section className="elevation-widget rounded-xl p-6">
            <h2 className="font-headline-sm text-xl text-on-surface">Metadata</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Founded', stock.founded],
                ['Headquarters', stock.headquarters],
                ['CIN / entity', stock.cin],
                ['Employees', stock.employees],
                ['Last funding', stock.lastFunding],
                ['Share class', stock.series],
                ['Lockup', stock.lockup],
                ['Website', stock.website],
              ].map(([label, value]) =>
                value ? (
                  <div key={label} className="rounded-lg bg-surface-container-low px-4 py-3">
                    <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</dt>
                    <dd className="mt-1 break-all text-sm font-medium text-on-surface">
                      {label === 'Website' ? (
                        <a className="text-primary underline-offset-2 hover:underline" href={value} target="_blank" rel="noopener noreferrer">
                          {value.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          </section>

          {/* Fundamentals & Key Ratios */}
          <section className="elevation-widget rounded-xl p-6">
            <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-headline-sm text-xl text-on-surface">Fundamentals & Key Ratios</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Official corporate identifiers, valuation multiples, capital efficiency, and trading bounds.
                </p>
              </div>
              <span className="self-start rounded-md border border-outline-variant/50 bg-surface-container px-2.5 py-1 font-mono text-xs text-on-surface-variant sm:self-auto">
                {stock.ticker}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: 'ISIN', value: stock.isin || '—', isMono: true, hint: 'Security Code' },
                { label: 'PAN Card', value: stock.pan || '—', isMono: true, hint: 'Entity Tax ID' },
                { label: 'Face Value', value: stock.faceValue != null ? `₹${stock.faceValue}` : '—', isMono: true, hint: 'Nominal share value' },
                { label: 'Book Value', value: stock.bookValue != null ? `₹${stock.bookValue}` : '—', isMono: true, hint: 'NAV per share' },
                { label: 'ROE', value: stock.roe != null ? `${stock.roe}%` : '—', isMono: true, hint: 'Return on Equity' },
                { label: 'Debt / Equity', value: stock.debtToEquity != null ? stock.debtToEquity.toString() : '—', isMono: true, hint: 'Leverage ratio' },
                { label: '52-Wk High', value: stock.week52High != null ? `₹${stock.week52High.toLocaleString('en-IN')}` : '—', isMono: true, hint: '1-Year High' },
                { label: '52-Wk Low', value: stock.week52Low != null ? `₹${stock.week52Low.toLocaleString('en-IN')}` : '—', isMono: true, hint: '1-Year Low' },
                { label: 'P/E Ratio', value: stock.peRatio != null ? stock.peRatio.toString() : '—', isMono: true, hint: 'Price / Earnings' },
                { label: 'P/B Ratio', value: stock.pbRatio != null ? stock.pbRatio.toString() : '—', isMono: true, hint: 'Price / Book' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5 transition-colors hover:border-outline-variant/70">
                  <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{item.label}</span>
                  <p className={`mt-1.5 text-base font-semibold text-on-surface ${item.isMono ? 'font-mono' : ''}`}>
                    {item.value}
                  </p>
                  <span className="text-[11px] text-on-surface-variant/80">{item.hint}</span>
                </div>
              ))}
            </div>
          </section>

          {years.length ? (
            <section className="elevation-widget rounded-xl p-6">
              <div className="flex flex-col gap-4 border-b border-outline-variant/30 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-headline-sm text-xl text-on-surface">Key Financials (YoY)</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">Figures in ₹ crore unless specified.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Statement Tab Switcher */}
                  <div className="inline-flex rounded-lg border border-outline-variant/40 bg-surface-container-low p-1" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={statementTab === 'income'}
                      onClick={() => setStatementTab('income')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        statementTab === 'income' ? 'bg-[#0F4A3D] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={statementTab === 'balance_sheet'}
                      onClick={() => setStatementTab('balance_sheet')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        statementTab === 'balance_sheet' ? 'bg-[#0F4A3D] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Balance Sheet
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={statementTab === 'cash_flow'}
                      onClick={() => setStatementTab('cash_flow')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        statementTab === 'cash_flow' ? 'bg-[#0F4A3D] text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Cash Flow
                    </button>
                  </div>

                  {/* Year Switcher */}
                  <div className="flex flex-wrap gap-1" role="tablist" aria-label="Financial year">
                    {years.map((y, i) => (
                      <button
                        key={y.year}
                        type="button"
                        role="tab"
                        aria-selected={yearIndex === i}
                        onClick={() => setYearIndex(i)}
                        className={`min-h-8 rounded-lg px-2.5 font-label-caps text-[11px] uppercase ${
                          yearIndex === i
                            ? 'bg-secondary-container/20 font-semibold text-secondary-container border border-secondary-container/30'
                            : 'text-on-surface-variant hover:bg-on-surface/5'
                        }`}
                      >
                        {y.year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Year Highlights */}
              {selected ? (
                <div className="mt-5">
                  {statementTab === 'income' && (
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
                      {[
                        ['Revenue', formatCr(selected.revenueCr)],
                        ['EBITDA', formatCr(selected.ebitdaCr)],
                        ['PBT', selected.pbtCr != null ? formatCr(selected.pbtCr) : '—'],
                        ['PAT', formatCr(selected.patCr)],
                        ['EPS', selected.eps != null ? `₹${selected.eps}` : '—'],
                        ['OPM (%)', selected.opmPct != null ? `${selected.opmPct}%` : '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5">
                          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
                          <p className="mt-1.5 font-data-md text-base font-semibold text-on-surface">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {statementTab === 'balance_sheet' && (
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
                      {[
                        ['Total Assets', selected.totalAssetsCr != null ? formatCr(selected.totalAssetsCr) : '—'],
                        ['Share Capital', selected.shareCapitalCr != null ? formatCr(selected.shareCapitalCr) : '—'],
                        ['Reserves', selected.reservesCr != null ? formatCr(selected.reservesCr) : '—'],
                        ['Borrowings', selected.borrowingsCr != null ? formatCr(selected.borrowingsCr) : '—'],
                        ['Total Liabilities', selected.totalLiabilitiesCr != null ? formatCr(selected.totalLiabilitiesCr) : '—'],
                        ['Investments', selected.investmentsCr != null ? formatCr(selected.investmentsCr) : '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5">
                          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
                          <p className="mt-1.5 font-data-md text-base font-semibold text-on-surface">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {statementTab === 'cash_flow' && (
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                      {[
                        ['CFO (Operating)', selected.cfoCr != null ? formatCr(selected.cfoCr) : '—'],
                        ['CF Investing', selected.cfInvestingCr != null ? formatCr(selected.cfInvestingCr) : '—'],
                        ['CF Financing', selected.cfFinancingCr != null ? formatCr(selected.cfFinancingCr) : '—'],
                        ['Net Cash Flow', selected.netCashCr != null ? formatCr(selected.netCashCr) : '—'],
                        ['Cash at End', selected.cashAtEndCr != null ? formatCr(selected.cashAtEndCr) : '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3.5">
                          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
                          <p className="mt-1.5 font-data-md text-base font-semibold text-on-surface">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Multi-Year Table */}
              <div className="mt-6 overflow-x-auto">
                {statementTab === 'income' && (
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <caption className="sr-only">Year-wise income statement</caption>
                    <thead>
                      <tr className="border-b border-outline-variant/40">
                        {['Year', 'Revenue', 'EBITDA', 'PBT', 'PAT', 'EPS (₹)', 'OPM (%)', 'Employees'].map((h) => (
                          <th key={h} className="px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {years.map((row, i) => (
                        <tr
                          key={row.year}
                          className={`border-b border-outline-variant/30 ${i === yearIndex ? 'bg-primary-container/10' : ''}`}
                        >
                          <td className="px-3 py-3 font-medium">{row.year}</td>
                          <td className="px-3 py-3 font-mono">{formatCr(row.revenueCr)}</td>
                          <td className={`px-3 py-3 font-mono ${row.ebitdaCr < 0 ? 'text-error' : 'text-bid'}`}>
                            {formatCr(row.ebitdaCr)}
                          </td>
                          <td className={`px-3 py-3 font-mono ${(row.pbtCr ?? 0) < 0 ? 'text-error' : 'text-bid'}`}>
                            {row.pbtCr != null ? formatCr(row.pbtCr) : '—'}
                          </td>
                          <td className={`px-3 py-3 font-mono ${row.patCr < 0 ? 'text-error' : 'text-bid'}`}>
                            {formatCr(row.patCr)}
                          </td>
                          <td className="px-3 py-3 font-mono">{row.eps != null ? `₹${row.eps}` : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.opmPct != null ? `${row.opmPct}%` : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.employees ? row.employees.toLocaleString('en-IN') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {statementTab === 'balance_sheet' && (
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <caption className="sr-only">Year-wise balance sheet</caption>
                    <thead>
                      <tr className="border-b border-outline-variant/40">
                        {['Year', 'Share Capital', 'Reserves', 'Borrowings', 'Total Assets', 'Total Liabilities', 'Investments'].map((h) => (
                          <th key={h} className="px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {years.map((row, i) => (
                        <tr
                          key={row.year}
                          className={`border-b border-outline-variant/30 ${i === yearIndex ? 'bg-primary-container/10' : ''}`}
                        >
                          <td className="px-3 py-3 font-medium">{row.year}</td>
                          <td className="px-3 py-3 font-mono">{row.shareCapitalCr != null ? formatCr(row.shareCapitalCr) : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.reservesCr != null ? formatCr(row.reservesCr) : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.borrowingsCr != null ? formatCr(row.borrowingsCr) : '—'}</td>
                          <td className="px-3 py-3 font-mono font-semibold">{row.totalAssetsCr != null ? formatCr(row.totalAssetsCr) : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.totalLiabilitiesCr != null ? formatCr(row.totalLiabilitiesCr) : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.investmentsCr != null ? formatCr(row.investmentsCr) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {statementTab === 'cash_flow' && (
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <caption className="sr-only">Year-wise cash flow</caption>
                    <thead>
                      <tr className="border-b border-outline-variant/40">
                        {['Year', 'CFO (Operating)', 'CF Investing', 'CF Financing', 'Net Cash Flow', 'Cash at End'].map((h) => (
                          <th key={h} className="px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {years.map((row, i) => (
                        <tr
                          key={row.year}
                          className={`border-b border-outline-variant/30 ${i === yearIndex ? 'bg-primary-container/10' : ''}`}
                        >
                          <td className="px-3 py-3 font-medium">{row.year}</td>
                          <td className={`px-3 py-3 font-mono ${(row.cfoCr ?? 0) < 0 ? 'text-error' : 'text-bid'}`}>
                            {row.cfoCr != null ? formatCr(row.cfoCr) : '—'}
                          </td>
                          <td className="px-3 py-3 font-mono">{row.cfInvestingCr != null ? formatCr(row.cfInvestingCr) : '—'}</td>
                          <td className="px-3 py-3 font-mono">{row.cfFinancingCr != null ? formatCr(row.cfFinancingCr) : '—'}</td>
                          <td className={`px-3 py-3 font-mono ${(row.netCashCr ?? 0) < 0 ? 'text-error' : 'text-bid'}`}>
                            {row.netCashCr != null ? formatCr(row.netCashCr) : '—'}
                          </td>
                          <td className="px-3 py-3 font-mono font-semibold">{row.cashAtEndCr != null ? formatCr(row.cashAtEndCr) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Visual trend bar for Income Statement */}
              {statementTab === 'income' && (
                <div className="mt-6 space-y-3" aria-hidden="true">
                  <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Revenue trend</p>
                  {years.map((row) => (
                    <div key={row.year} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 font-mono text-xs text-on-surface-variant">{row.year}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                        <div
                          className="h-full rounded-full bg-primary-container"
                          style={{ width: `${Math.max(6, (Math.abs(row.revenueCr) / maxAbsRevenue) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <section className="elevation-widget rounded-xl p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ChartPieSlice size={20} className="text-[#0F4A3D]" aria-hidden="true" />
                  <h2 className="font-headline-sm text-xl text-on-surface">Shareholding pattern</h2>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">Equity ownership and cap-table breakdown by year.</p>
              </div>
              {shareholdings.length > 0 ? (
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Shareholding year">
                  {shareholdings.map((sh, i) => (
                    <button
                      key={sh.year}
                      type="button"
                      role="tab"
                      aria-selected={shYearIndex === i}
                      onClick={() => setShYearIndex(i)}
                      className={`min-h-9 rounded-lg px-3 font-label-caps text-[11px] uppercase transition-colors ${
                        shYearIndex === i
                          ? 'bg-[#0F4A3D] text-white shadow-sm'
                          : 'text-on-surface-variant hover:bg-on-surface/5'
                      }`}
                    >
                      {sh.year}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {shareholdings.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-low/40 p-6 text-center">
                <ChartPieSlice size={32} className="mx-auto text-on-surface-variant/50" />
                <p className="mt-2 text-sm font-medium text-on-surface">No Shareholding Pattern Filed Yet</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Cap-table filings and ownership allocations for {stock.name} will appear here once published by company governance.
                </p>
              </div>
            ) : selectedSh ? (
              <div className="mt-6 space-y-6">
                {/* Visual Allocation Segmented Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-medium">Total Cap-Table Allocation ({selectedSh.year})</span>
                    <span className="font-mono font-medium">
                      {(selectedSh.promotersPct + selectedSh.institutionsPct + selectedSh.retailPublicPct + selectedSh.esopOthersPct).toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container"
                    title={`Promoters: ${selectedSh.promotersPct}%, Institutions: ${selectedSh.institutionsPct}%, Retail: ${selectedSh.retailPublicPct}%, ESOP: ${selectedSh.esopOthersPct}%`}
                  >
                    <div
                      style={{ width: `${selectedSh.promotersPct}%` }}
                      className="bg-[#0F4A3D] transition-all duration-300"
                    />
                    <div
                      style={{ width: `${selectedSh.institutionsPct}%` }}
                      className="bg-[#2563EB] transition-all duration-300"
                    />
                    <div
                      style={{ width: `${selectedSh.retailPublicPct}%` }}
                      className="bg-[#D97706] transition-all duration-300"
                    />
                    <div
                      style={{ width: `${selectedSh.esopOthersPct}%` }}
                      className="bg-[#7C3AED] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* 4 Cards Breakdown */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: 'Promoters & Founders',
                      val: `${selectedSh.promotersPct}%`,
                      color: 'bg-[#0F4A3D]',
                      desc: 'Founders & promoter entities',
                    },
                    {
                      label: 'Institutional / VCs',
                      val: `${selectedSh.institutionsPct}%`,
                      color: 'bg-[#2563EB]',
                      desc: 'Foreign & domestic institutional VCs',
                    },
                    {
                      label: 'Public & Retail',
                      val: `${selectedSh.retailPublicPct}%`,
                      color: 'bg-[#D97706]',
                      desc: 'HNIs, angel investors & public',
                    },
                    {
                      label: 'ESOP Pool & Others',
                      val: `${selectedSh.esopOthersPct}%`,
                      color: 'bg-[#7C3AED]',
                      desc: 'Employee options & unallocated',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-4 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                          {item.label}
                        </p>
                      </div>
                      <p className="mt-2 font-data-md text-data-md text-on-surface font-mono font-semibold">
                        {item.val}
                      </p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {selectedSh.notes ? (
                  <div className="rounded-lg bg-surface-container-lowest/60 border border-outline-variant/30 px-3.5 py-2 text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="font-medium text-on-surface">Filing Reference:</span>
                    <span>{selectedSh.notes}</span>
                  </div>
                ) : null}

                {/* Multi-year comparison table if more than 1 year available */}
                {shareholdings.length > 1 ? (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[32rem] text-left text-sm">
                      <caption className="sr-only">Year-wise shareholding pattern</caption>
                      <thead>
                        <tr className="border-b border-outline-variant/40">
                          {['Year', 'Promoters', 'Institutions (VC/FII)', 'Public & Retail', 'ESOP & Others', 'Notes'].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shareholdings.map((row, i) => (
                          <tr
                            key={row.year}
                            className={`border-b border-outline-variant/30 ${
                              i === shYearIndex ? 'bg-primary-container/10' : ''
                            }`}
                          >
                            <td className="px-3 py-3 font-medium">{row.year}</td>
                            <td className="px-3 py-3 font-mono font-medium text-[#0F4A3D]">{row.promotersPct}%</td>
                            <td className="px-3 py-3 font-mono font-medium text-[#2563EB]">{row.institutionsPct}%</td>
                            <td className="px-3 py-3 font-mono font-medium text-[#D97706]">{row.retailPublicPct}%</td>
                            <td className="px-3 py-3 font-mono font-medium text-[#7C3AED]">{row.esopOthersPct}%</td>
                            <td className="px-3 py-3 text-xs text-on-surface-variant">{row.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          {(stock.documents ?? []).length ? (
            <section className="elevation-widget rounded-xl p-6">
              <h2 className="font-headline-sm text-xl text-on-surface">Documents</h2>
              <ul className="mt-4 divide-y divide-outline-variant/40">
                {stock.documents!.map((doc) => (
                  <li key={doc.title} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 shrink-0 text-primary" size={20} aria-hidden="true" />
                      <div>
                        <p className="font-medium text-on-surface">{doc.title}</p>
                        <p className="text-sm text-on-surface-variant">
                          {doc.type} · {doc.date}
                        </p>
                      </div>
                    </div>
                    <a className="btn-secondary min-h-10 text-sm" href={doc.url || doc.href || '#'}>
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </QueryStatus>
  );
}
