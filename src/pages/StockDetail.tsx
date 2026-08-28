import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, TrendDown, TrendUp } from '@phosphor-icons/react';
import { CompanyLogo } from '../components/ui';
import { getStock, type Stock } from '../data/stocks';
import { loginPath, useAuth } from '../auth';

type ChartRange = '1D' | '1W' | '1M' | '1Y';

function formatCr(n: number) {
  const sign = n < 0 ? '−' : '';
  return `${sign}₹${Math.abs(n).toLocaleString('en-IN')} Cr`;
}

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hashId(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPriceSeries(stock: Stock, range: ChartRange) {
  const count = range === '1D' ? 48 : range === '1W' ? 7 : range === '1M' ? 22 : 52;
  const vol = range === '1D' ? 0.006 : range === '1W' ? 0.016 : range === '1M' ? 0.028 : 0.055;
  const rng = mulberry32(hashId(`${stock.id}-${range}`));
  const values: number[] = [stock.price];
  let p = stock.price;
  const drift = stock.change >= 0 ? 0.0012 : -0.0012;
  for (let i = 1; i < count; i += 1) {
    p /= 1 + (rng() - 0.48) * vol + drift;
    values.unshift(p);
  }
  const scale = stock.price / values[values.length - 1];
  return values.map((v, i) => ({ i, price: v * scale }));
}

function PriceChart({ stock }: { stock: Stock }) {
  const [range, setRange] = useState<ChartRange>('1M');
  const [hover, setHover] = useState<{ x: number; y: number; price: number; index: number } | null>(null);

  const series = useMemo(() => buildPriceSeries(stock, range), [stock, range]);
  const min = Math.min(...series.map((p) => p.price));
  const max = Math.max(...series.map((p) => p.price));
  const pad = (max - min) * 0.12 || stock.price * 0.02;
  const yMin = min - pad;
  const yMax = max + pad;
  const w = 100;
  const h = 56;
  const last = series[series.length - 1];
  const first = series[0];
  const up = last.price >= first.price;

  const coords = series.map((pt) => {
    const x = series.length === 1 ? 0 : (pt.i / (series.length - 1)) * w;
    const y = yMax === yMin ? h / 2 : ((yMax - pt.price) / (yMax - yMin)) * h;
    return { x, y, price: pt.price };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const stroke = up ? 'rgb(var(--color-bid))' : 'rgb(var(--color-ask))';
  const avg = series.reduce((s, p) => s + p.price, 0) / series.length;
  const rangeChange = ((last.price - first.price) / first.price) * 100;

  return (
    <section className="elevation-widget rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-sm text-xl text-on-surface">Price chart</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Illustrative last-traded path. Not a live exchange quote.
          </p>
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
                    ? 'bg-primary-container text-on-primary-container'
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
          <path d={area} fill={`url(#priceFill-${stock.id})`} />
          <path d={line} fill="none" stroke={stroke} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
          {hover && (
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
          )}
        </svg>
        {hover && (
          <div
            className="elevation-widget pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-xs"
            style={{
              left: Math.min(Math.max(hover.x - 56, 8), 220),
              top: Math.max(hover.y - 56, 8),
            }}
          >
            <p className="font-mono font-semibold">{formatInr(hover.price)}</p>
            <p className="text-on-surface-variant">
              Point {hover.index + 1} of {series.length}
            </p>
          </div>
        )}
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
  const stock = getStock(id);
  const { user } = useAuth();
  const [yearIndex, setYearIndex] = useState(0);

  const years = stock?.financials ?? [];
  const selected = years[yearIndex] ?? years[0];

  const maxAbsRevenue = useMemo(() => {
    if (!stock) return 1;
    return Math.max(...stock.financials.map((y) => Math.abs(y.revenueCr)), 1);
  }, [stock]);

  if (!stock) {
    return (
      <div className="elevation-widget rounded-xl px-6 py-16 text-center">
        <p className="font-headline-sm text-lg text-on-surface">Company not found</p>
        <p className="mt-2 font-body-md text-on-surface-variant">This name is not on the current book.</p>
        <button type="button" className="btn-secondary mt-6" onClick={() => navigate('/explore')}>
          Back to companies
        </button>
      </div>
    );
  }

  return (
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

      <section className="elevation-widget rounded-xl p-6">
        <h2 className="font-headline-sm text-xl text-on-surface">Description</h2>
        <p className="mt-3 max-w-[70ch] font-body-md leading-relaxed text-on-surface-variant">{stock.description}</p>
      </section>

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
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-surface-container-low px-4 py-3">
              <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</dt>
              <dd className="mt-1 break-all text-sm font-medium text-on-surface">
                {label === 'Website' ? (
                  <a className="text-primary underline-offset-2 hover:underline" href={value} target="_blank" rel="noreferrer">
                    {value.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="elevation-widget rounded-xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline-sm text-xl text-on-surface">Financials by year</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Illustrative figures in ₹ crore. Not audited live data.</p>
          </div>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Financial year">
            {years.map((y, i) => (
              <button
                key={y.year}
                type="button"
                role="tab"
                aria-selected={yearIndex === i}
                onClick={() => setYearIndex(i)}
                className={`min-h-9 rounded-lg px-3 font-label-caps text-[11px] uppercase ${
                  yearIndex === i
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-on-surface/5'
                }`}
              >
                {y.year}
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Revenue', formatCr(selected.revenueCr)],
              ['EBITDA', formatCr(selected.ebitdaCr)],
              ['PAT', formatCr(selected.patCr)],
              ['Employees', selected.employees.toLocaleString('en-IN')],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-4">
                <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
                <p className="mt-2 font-data-md text-data-md text-on-surface">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Year-wise financials</caption>
            <thead>
              <tr className="border-b border-outline-variant/40">
                {['Year', 'Revenue', 'EBITDA', 'PAT', 'Employees'].map((h) => (
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
                  <td className={`px-3 py-3 font-mono ${row.patCr < 0 ? 'text-error' : 'text-bid'}`}>
                    {formatCr(row.patCr)}
                  </td>
                  <td className="px-3 py-3 font-mono">{row.employees.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </section>

      <section className="elevation-widget rounded-xl p-6">
        <h2 className="font-headline-sm text-xl text-on-surface">Documents</h2>
        <ul className="mt-4 divide-y divide-outline-variant/40">
          {stock.documents.map((doc) => (
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
              <a className="btn-secondary min-h-10 text-sm" href={doc.href}>
                View
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
