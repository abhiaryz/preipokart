import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, TrendDown, TrendUp } from '@phosphor-icons/react';
import { CompanyLogo, PageHeader, QueryStatus } from '../components/ui';
import { api } from '../api';
import { useApi } from '../hooks/useApi';

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('change');

  const { data, error, loading } = useApi(
    () => api.listStocks({ q: searchQuery, sector: selectedSector, sort: sortBy }),
    [searchQuery, selectedSector, sortBy],
  );

  const stocks = data?.data ?? [];
  const sectors = useMemo(() => ['All', ...(data?.meta.sectors ?? [])], [data?.meta.sectors]);

  return (
    <div>
      <PageHeader
        title="Companies"
        description="These companies are not yet listed on the stock exchange. Tap a card to see the company page."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            size={16}
            aria-hidden="true"
          />
          <input
            className="field py-2.5 pl-10"
            placeholder="Search a company"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search companies"
          />
        </div>
        <div className="flex rounded-lg bg-surface-container-low p-1">
          {(['change', 'price', 'name'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortBy(mode)}
              className={`min-h-9 flex-1 rounded-lg px-3 font-label-caps text-[10px] uppercase transition-colors sm:flex-none ${
                sortBy === mode
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {mode === 'change' ? '% change' : mode === 'price' ? 'Price' : 'Name'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sectors.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setSelectedSector(sec)}
            className={`min-h-9 whitespace-nowrap rounded-lg px-3 font-label-caps text-[11px] uppercase transition-colors ${
              selectedSector === sec
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      <QueryStatus loading={loading && !data} error={error}>
        {stocks.length === 0 ? (
          <div className="elevation-widget rounded-xl px-6 py-16 text-center">
            <p className="font-headline-sm text-lg text-on-surface">No names match these filters</p>
            <p className="mt-2 font-body-md text-on-surface-variant">Clear search or pick All to see the full book.</p>
            <button
              type="button"
              className="btn-secondary mt-6"
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('All');
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-3" aria-busy={loading}>
            {stocks.map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => navigate(`/stocks/${eq.id}`)}
                className="elevation-widget flex flex-col gap-4 rounded-xl p-6 text-left transition duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <CompanyLogo name={eq.name} domain={eq.domain} />
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 font-label-caps text-label-caps ${
                      eq.change >= 0
                        ? 'bg-secondary-container/10 text-secondary-container'
                        : 'bg-error-container/25 text-error'
                    }`}
                  >
                    {eq.change >= 0 ? <TrendUp size={14} aria-hidden="true" /> : <TrendDown size={14} aria-hidden="true" />}
                    {Math.abs(eq.change)}%
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-xl text-on-surface">{eq.name}</h2>
                  <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">{eq.sector}</p>
                </div>
                <div className="mt-auto border-t border-on-surface/10 pt-4">
                  <p className="font-data-lg text-data-lg text-on-surface">₹{eq.price.toLocaleString('en-IN')}</p>
                  <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Last traded</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </QueryStatus>
    </div>
  );
}
