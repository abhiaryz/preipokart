import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretDown, CaretUp, MagnifyingGlass, TrendDown, TrendUp } from '@phosphor-icons/react';
import { CompanyLogo, PageHeader, QueryStatus } from '../components/ui';
import { ExploreViewSwitch } from '../components/ExploreViewSwitch';
import { api } from '../api';
import type { StockListItem } from '../api/types';
import { useApi } from '../hooks/useApi';

type SortKey = 'name' | 'ticker' | 'sector' | 'price' | 'change' | 'impliedVal' | 'lockup' | 'series';
type SortDir = 'asc' | 'desc';

function parseImpliedValCr(value?: string | null): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, '').match(/([\d.]+)\s*([KkLl])?\s*Cr/i);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'K') return n * 1_000;
  if (suffix === 'L') return n * 100_000;
  return n;
}

function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((v): v is string => Boolean(v && v.trim())))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function compareRows(a: StockListItem, b: StockListItem, key: SortKey, dir: SortDir) {
  const mul = dir === 'asc' ? 1 : -1;
  const av = a[key];
  const bv = b[key];

  if (key === 'price' || key === 'change') {
    return ((a[key] as number) - (b[key] as number)) * mul;
  }
  if (key === 'impliedVal') {
    const an = parseImpliedValCr(a.impliedVal) ?? -Infinity;
    const bn = parseImpliedValCr(b.impliedVal) ?? -Infinity;
    return (an - bn) * mul;
  }

  return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { sensitivity: 'base' }) * mul;
}

const columns: Array<{ key: SortKey; label: string; align?: 'left' | 'right' }> = [
  { key: 'name', label: 'Company' },
  { key: 'sector', label: 'Sector' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'change', label: '% Change', align: 'right' },
  { key: 'impliedVal', label: 'Implied val', align: 'right' },
  { key: 'lockup', label: 'Lockup' },
  { key: 'series', label: 'Series' },
];

export default function ExploreScreener() {
  const navigate = useNavigate();
  const { data, error, loading } = useApi(() => api.listStocks({ pageSize: 100, sort: 'name', order: 'asc' }), []);

  const stocks = data?.data ?? [];
  const sectors = useMemo(() => uniqueSorted(data?.meta?.sectors ?? stocks.map((s) => s.sector)), [data?.meta?.sectors, stocks]);
  const lockups = useMemo(() => uniqueSorted(stocks.map((s) => s.lockup)), [stocks]);
  const seriesOptions = useMemo(() => uniqueSorted(stocks.map((s) => s.series)), [stocks]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [changeMin, setChangeMin] = useState('');
  const [changeMax, setChangeMax] = useState('');
  const [impliedMin, setImpliedMin] = useState('');
  const [impliedMax, setImpliedMax] = useState('');
  const [lockup, setLockup] = useState('All');
  const [series, setSeries] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('change');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const pMin = parseOptionalNumber(priceMin);
    const pMax = parseOptionalNumber(priceMax);
    const cMin = parseOptionalNumber(changeMin);
    const cMax = parseOptionalNumber(changeMax);
    const iMin = parseOptionalNumber(impliedMin);
    const iMax = parseOptionalNumber(impliedMax);

    const rows = stocks.filter((stock) => {
      if (q) {
        const hay = `${stock.name} ${stock.ticker} ${stock.sector}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedSectors.length > 0 && !selectedSectors.includes(stock.sector)) return false;
      if (pMin != null && stock.price < pMin) return false;
      if (pMax != null && stock.price > pMax) return false;
      if (cMin != null && stock.change < cMin) return false;
      if (cMax != null && stock.change > cMax) return false;
      if (iMin != null || iMax != null) {
        const implied = parseImpliedValCr(stock.impliedVal);
        if (implied == null) return false;
        if (iMin != null && implied < iMin) return false;
        if (iMax != null && implied > iMax) return false;
      }
      if (lockup !== 'All' && stock.lockup !== lockup) return false;
      if (series !== 'All' && stock.series !== series) return false;
      return true;
    });

    return [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [
    stocks,
    searchQuery,
    selectedSectors,
    priceMin,
    priceMax,
    changeMin,
    changeMax,
    impliedMin,
    impliedMax,
    lockup,
    series,
    sortKey,
    sortDir,
  ]);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector],
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setPriceMin('');
    setPriceMax('');
    setChangeMin('');
    setChangeMax('');
    setImpliedMin('');
    setImpliedMax('');
    setLockup('All');
    setSeries('All');
  };

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'name' || key === 'ticker' || key === 'sector' || key === 'lockup' || key === 'series' ? 'asc' : 'desc');
  };

  return (
    <div>
      <PageHeader
        title="Screener"
        description="Dense list with client-side filters on price, change, implied valuation, lockup, and series."
        actions={<ExploreViewSwitch active="screener" />}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low/40 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative w-full lg:max-w-xs">
            <label className="label" htmlFor="screener-search">
              Search
            </label>
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-[2.15rem] text-on-surface-variant"
              size={16}
              aria-hidden="true"
            />
            <input
              id="screener-search"
              className="field py-2.5 pl-10"
              placeholder="Name, ticker, sector"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <RangeField label="Price min" value={priceMin} onChange={setPriceMin} placeholder="0" />
            <RangeField label="Price max" value={priceMax} onChange={setPriceMax} placeholder="10000" />
            <RangeField label="% chg min" value={changeMin} onChange={setChangeMin} placeholder="-10" />
            <RangeField label="% chg max" value={changeMax} onChange={setChangeMax} placeholder="10" />
            <RangeField label="Impl. ₹ Cr min" value={impliedMin} onChange={setImpliedMin} placeholder="1000" />
            <RangeField label="Impl. ₹ Cr max" value={impliedMax} onChange={setImpliedMax} placeholder="500000" />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <p className="label">Sector</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedSectors([])}
                className={`min-h-9 whitespace-nowrap rounded-lg px-3 font-label-caps text-[11px] uppercase transition-colors ${
                  selectedSectors.length === 0
                    ? 'bg-[#0F4A3D] text-white'
                    : 'bg-card text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All
              </button>
              {sectors.map((sec) => {
                const active = selectedSectors.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleSector(sec)}
                    className={`min-h-9 whitespace-nowrap rounded-lg px-3 font-label-caps text-[11px] uppercase transition-colors ${
                      active
                        ? 'bg-[#0F4A3D] text-white'
                        : 'bg-card text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {sec}
                  </button>
                );
              })}
            </div>
          </div>

          <SelectField
            label="Lockup"
            value={lockup}
            onChange={setLockup}
            options={['All', ...lockups]}
          />
          <SelectField
            label="Series"
            value={series}
            onChange={setSeries}
            options={['All', ...seriesOptions]}
          />
          <button type="button" className="btn-secondary min-h-10 shrink-0" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-on-surface-variant">
        Showing <span className="font-medium text-on-surface">{filtered.length}</span> of {stocks.length} companies
      </p>

      <QueryStatus loading={loading && !data} error={error}>
        {filtered.length === 0 ? (
          <div className="elevation-widget rounded-xl px-6 py-16 text-center">
            <p className="font-headline-sm text-lg text-on-surface">No names match these filters</p>
            <p className="mt-2 font-body-md text-on-surface-variant">Widen ranges or clear sector / lockup / series.</p>
            <button type="button" className="btn-secondary mt-6" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: cards always */}
            <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 md:hidden" aria-busy={loading}>
              {filtered.map((stock) => (
                <button
                  key={stock.id}
                  type="button"
                  onClick={() => navigate(`/stocks/${stock.id}`)}
                  className="elevation-widget flex flex-col gap-4 rounded-xl p-5 text-left transition duration-200 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <CompanyLogo name={stock.name} domain={stock.domain} />
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 font-label-caps text-label-caps ${
                        stock.change >= 0
                          ? 'bg-secondary-container/10 text-secondary-container'
                          : 'bg-error-container/25 text-error'
                      }`}
                    >
                      {stock.change >= 0 ? (
                        <TrendUp size={14} aria-hidden="true" />
                      ) : (
                        <TrendDown size={14} aria-hidden="true" />
                      )}
                      {Math.abs(stock.change)}%
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-xl text-on-surface">{stock.name}</h2>
                    <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                      {stock.ticker} · {stock.sector}
                    </p>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-3 border-t border-on-surface/10 pt-4">
                    <div>
                      <p className="font-data-lg text-data-lg text-on-surface">
                        ₹{stock.price.toLocaleString('en-IN')}
                      </p>
                      <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Last traded</p>
                    </div>
                    <div className="text-right">
                      <p className="font-data-sm text-sm text-on-surface">{stock.impliedVal ?? '—'}</p>
                      <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Implied val</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop: dense table */}
            <div className="hidden overflow-x-auto rounded-xl border border-outline-variant/40 md:block" aria-busy={loading}>
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/40 bg-surface-container-low/60 text-on-surface-variant">
                    {columns.map((col) => {
                      const active = sortKey === col.key;
                      return (
                        <th
                          key={col.key}
                          scope="col"
                          className={`py-2.5 pl-3 pr-2 font-label-caps text-[11px] uppercase ${
                            col.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSort(col.key)}
                            className={`inline-flex items-center gap-1 hover:text-on-surface ${
                              col.align === 'right' ? 'ml-auto' : ''
                            } ${active ? 'text-on-surface' : ''}`}
                          >
                            {col.label}
                            {active ? (
                              sortDir === 'asc' ? (
                                <CaretUp size={12} aria-hidden="true" />
                              ) : (
                                <CaretDown size={12} aria-hidden="true" />
                              )
                            ) : null}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((stock) => (
                    <tr
                      key={stock.id}
                      className="cursor-pointer border-b border-outline-variant/25 transition-colors hover:bg-on-surface/[0.03]"
                      onClick={() => navigate(`/stocks/${stock.id}`)}
                    >
                      <td className="py-2.5 pl-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo name={stock.name} domain={stock.domain} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium leading-tight">{stock.name}</p>
                            <p className="font-data-sm text-xs text-on-surface-variant">{stock.ticker}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-on-surface-variant">{stock.sector}</td>
                      <td className="py-2.5 pr-2 text-right font-data-sm">
                        ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-2.5 pr-2 text-right font-data-sm ${
                          stock.change >= 0 ? 'text-bid' : 'text-ask'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change.toFixed(2)}%
                      </td>
                      <td className="py-2.5 pr-2 text-right font-data-sm">{stock.impliedVal ?? '—'}</td>
                      <td className="py-2.5 pr-2 text-on-surface-variant">{stock.lockup ?? '—'}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{stock.series ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </QueryStatus>
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field py-2"
        type="number"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = `screener-${label.toLowerCase()}`;
  return (
    <div className="w-full sm:w-44">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="field py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
