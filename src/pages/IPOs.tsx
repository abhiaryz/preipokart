import { useMemo, useState } from 'react';
import { CalendarBlank, SealCheck, TrendUp } from '@phosphor-icons/react';
import { CompanyLogo, PageHeader, QueryStatus } from '../components/ui';
import { api } from '../api';
import type { IpoStatus } from '../api/types';
import { useApi } from '../hooks/useApi';
import { asIpoStatus, formatIpoDate, ipoFilters, ipoStatusLabel } from '../lib/format';

const statusTone: Record<IpoStatus, string> = {
  open: 'bg-bid/15 text-bid',
  upcoming: 'bg-primary-container text-on-primary-container',
  drhp: 'bg-surface-container-high text-on-surface',
  closed: 'bg-secondary-container text-on-secondary-container',
  listed: 'bg-surface-container-low text-on-surface-variant',
};

export default function IPOs() {
  const [filter, setFilter] = useState<(typeof ipoFilters)[number]['id']>('all');
  const { data, error, loading } = useApi(() => api.listIpos(filter), [filter]);
  const ipos = data?.data ?? [];

  const counts = useMemo(
    () => ({
      open: ipos.filter((i) => i.status === 'open').length,
      upcoming: ipos.filter((i) => i.status === 'upcoming').length,
      drhp: ipos.filter((i) => i.status === 'drhp').length,
    }),
    [ipos],
  );

  return (
    <div>
      <PageHeader
        title="IPOs"
        description="Upcoming issues, companies whose DRHP has been accepted, IPOs that are open for bidding, and recent listings."
      />

      <QueryStatus loading={loading && !data} error={error}>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="card flex items-start gap-3 p-4">
            <TrendUp className="mt-0.5 shrink-0 text-bid" size={22} aria-hidden="true" />
            <div>
              <p className="font-data-md text-data-md">{counts.open}</p>
              <p className="text-sm text-on-surface-variant">IPOs open for subscription</p>
            </div>
          </article>
          <article className="card flex items-start gap-3 p-4">
            <CalendarBlank className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" />
            <div>
              <p className="font-data-md text-data-md">{counts.upcoming}</p>
              <p className="text-sm text-on-surface-variant">Upcoming with dates announced</p>
            </div>
          </article>
          <article className="card flex items-start gap-3 p-4">
            <SealCheck className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" />
            <div>
              <p className="font-data-md text-data-md">{counts.drhp}</p>
              <p className="text-sm text-on-surface-variant">DRHP filed / observations stage</p>
            </div>
          </article>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="IPO stage">
          {ipoFilters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`min-h-9 whitespace-nowrap rounded-lg px-3 font-label-caps text-[11px] uppercase transition-colors ${
                filter === tab.id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-3 text-sm text-on-surface-variant">
          {ipos.length} {ipos.length === 1 ? 'issue' : 'issues'}
        </p>

        <ul className="grid gap-4 lg:hidden">
          {ipos.map((ipo) => {
            const status = asIpoStatus(ipo.status);
            return (
              <li key={ipo.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <CompanyLogo name={ipo.name} domain={ipo.domain} size="sm" />
                    <div className="min-w-0">
                      <h2 className="font-medium leading-snug">{ipo.name}</h2>
                      <p className="text-xs text-on-surface-variant">
                        {ipo.sector} · {ipo.issueType}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${statusTone[status]}`}>
                    {ipoStatusLabel[status]}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <dt className="text-on-surface-variant">Price band</dt>
                    <dd>{ipo.priceBand ?? 'TBA'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Issue size</dt>
                    <dd>{ipo.issueSize ?? 'TBA'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Open – close</dt>
                    <dd>
                      {formatIpoDate(ipo.openDate)} – {formatIpoDate(ipo.closeDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Listing</dt>
                    <dd>{formatIpoDate(ipo.listingDate)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-on-surface-variant">
                  {ipo.sebiStatus}
                  {ipo.note ? `. ${ipo.note}` : ''}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/40 text-on-surface-variant">
                <th className="py-3 pr-3 font-label-caps text-[11px] uppercase">Company</th>
                <th className="py-3 pr-3 font-label-caps text-[11px] uppercase">Stage</th>
                <th className="py-3 pr-3 font-label-caps text-[11px] uppercase">Price band</th>
                <th className="py-3 pr-3 font-label-caps text-[11px] uppercase">Size / lot</th>
                <th className="py-3 pr-3 font-label-caps text-[11px] uppercase">Window</th>
                <th className="py-3 pr-3 font-label-caps text-[11px] uppercase">SEBI / GMP</th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo) => {
                const status = asIpoStatus(ipo.status);
                return (
                  <tr key={ipo.id} className="border-b border-outline-variant/30 align-top">
                    <td className="py-4 pr-3">
                      <div className="flex items-start gap-2.5">
                        <CompanyLogo name={ipo.name} domain={ipo.domain} size="sm" />
                        <div>
                          <p className="font-medium">{ipo.name}</p>
                          <p className="text-xs text-on-surface-variant">{ipo.legalName}</p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {ipo.sector} · {ipo.exchange} · {ipo.issueType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-medium ${statusTone[status]}`}>
                        {ipoStatusLabel[status]}
                      </span>
                    </td>
                    <td className="py-4 pr-3 font-data-sm">{ipo.priceBand ?? 'TBA'}</td>
                    <td className="py-4 pr-3">
                      <p>{ipo.issueSize ?? 'TBA'}</p>
                      <p className="text-xs text-on-surface-variant">Lot {ipo.lotSize ?? 'TBA'}</p>
                    </td>
                    <td className="py-4 pr-3">
                      <p>
                        {formatIpoDate(ipo.openDate)} – {formatIpoDate(ipo.closeDate)}
                      </p>
                      <p className="text-xs text-on-surface-variant">List {formatIpoDate(ipo.listingDate)}</p>
                      <p className="text-xs text-on-surface-variant">DRHP {formatIpoDate(ipo.drhpDate)}</p>
                    </td>
                    <td className="py-4 pr-3">
                      <p>{ipo.sebiStatus}</p>
                      {ipo.subscription ? <p className="text-xs text-on-surface-variant">Sub {ipo.subscription}</p> : null}
                      {ipo.gmp ? <p className="text-xs text-on-surface-variant">GMP {ipo.gmp}</p> : null}
                      <p className="mt-1 text-xs text-on-surface-variant">{ipo.leadManagers}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </QueryStatus>
    </div>
  );
}
