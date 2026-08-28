import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendDown, TrendUp, Wallet } from '@phosphor-icons/react';
import { CompanyLogo, PageHeader, QueryStatus } from '../components/ui';
import { api } from '../api';
import type { Holding } from '../api/types';
import { useApi } from '../hooks/useApi';
import { STATUS_LABEL, formatInr, formatSignedInr } from '../lib/format';

type SortKey = 'marketValue' | 'unrealized' | 'dayChangePct' | 'quantity' | 'company';

const barTone = ['bg-primary-container', 'bg-secondary-container', 'bg-bid', 'bg-accent', 'bg-outline'];

function PnL({ value, pct }: { value: number; pct?: number }) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? TrendUp : TrendDown;
  return (
    <span className={`inline-flex items-center gap-1 font-mono ${up ? 'text-bid' : down ? 'text-ask' : 'text-on-surface'}`}>
      {value !== 0 ? <Icon size={14} aria-hidden="true" /> : null}
      <span>
        {formatSignedInr(value)}
        {pct != null ? ` (${up ? '+' : down ? '−' : ''}${Math.abs(pct).toFixed(1)}%)` : ''}
      </span>
      <span className="sr-only">{up ? 'gain' : down ? 'loss' : 'unchanged'}</span>
    </span>
  );
}

export default function Portfolio() {
  const navigate = useNavigate();
  const { data: snapshot, error, loading } = useApi(() => api.getPortfolio(), []);
  const [sortKey, setSortKey] = useState<SortKey>('marketValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const holdings = snapshot?.holdings ?? [];
  const sorted = useMemo(() => {
    const next = [...holdings];
    next.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return next;
  }, [holdings, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'company' ? 'asc' : 'desc');
  };

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' => {
    if (sortKey !== key) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  const empty = holdings.length === 0;

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Shares you already own after a deal settles, plus profit or loss against today’s last price. Open requests stay on Orders until they complete."
        actions={
          <button type="button" className="btn-primary" onClick={() => navigate('/explore')}>
            <Wallet size={16} aria-hidden="true" />
            Browse companies
          </button>
        }
      />

      <QueryStatus loading={loading} error={error}>
        {snapshot ? (
          <>
            <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio totals">
              <article className="card p-4">
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Current value</p>
                <p className="mt-2 font-headline-sm text-2xl tracking-tight">{formatInr(snapshot.marketValue)}</p>
                <p className="mt-1 text-sm text-on-surface-variant">Invested {formatInr(snapshot.invested)}</p>
              </article>
              <article className="card p-4">
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Unrealized P&amp;L</p>
                <p className="mt-2 text-xl">
                  <PnL value={snapshot.unrealized} pct={snapshot.unrealizedPct} />
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">If you sold everything at last price</p>
              </article>
              <article className="card p-4">
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Today</p>
                <p className="mt-2 text-xl">
                  <PnL value={snapshot.dayPnl} />
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">Move vs yesterday’s close on held names</p>
              </article>
              <article className="card p-4">
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Realized P&amp;L</p>
                <p className="mt-2 text-xl">
                  <PnL value={snapshot.realized} />
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">Escrow in flight {formatInr(snapshot.escrowIn)}</p>
              </article>
            </section>

            {!empty ? (
              <section className="card mb-6 p-4 md:p-5">
                <h2 className="font-headline-sm text-lg">Mix by sector</h2>
                <p className="mt-1 max-w-[65ch] text-sm text-on-surface-variant">
                  Share of current value. Percentages are also listed so the bar is not the only cue.
                </p>
                <div className="mt-4 flex h-4 overflow-hidden rounded-full border border-outline-variant/50" role="img" aria-label="Sector allocation stacked bar">
                  {snapshot.allocation.map((slice, i) => (
                    <span
                      key={slice.sector}
                      className={`${barTone[i % barTone.length]} h-full`}
                      style={{ width: `${slice.pct}%` }}
                      title={`${slice.sector} ${slice.pct.toFixed(1)}%`}
                    />
                  ))}
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {snapshot.allocation.map((slice, i) => (
                    <li key={slice.sector} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-sm ${barTone[i % barTone.length]}`} aria-hidden="true" />
                        {slice.sector}
                      </span>
                      <span className="font-mono text-on-surface-variant">
                        {slice.pct.toFixed(1)}% · {formatInr(slice.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <h2 className="mb-3 font-headline-sm text-lg">Holdings</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {(
                      [
                        ['company', 'Company'],
                        ['quantity', 'Shares'],
                        ['marketValue', 'Value'],
                        ['unrealized', 'Unrealized'],
                        ['dayChangePct', 'Today'],
                      ] as const
                    ).map(([key, label]) => (
                      <th key={key} aria-sort={ariaSort(key)} className="px-3 py-2">
                        <button
                          type="button"
                          className="cursor-pointer font-mono text-[10px] font-medium uppercase tracking-wider text-on-surface-variant"
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                          {sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                        </button>
                      </th>
                    ))}
                    <th className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <HoldingTableRow key={row.assetId} row={row} />
                  ))}
                  {empty ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-on-surface-variant">
                        No settled shares yet. Completed buys show up here.{' '}
                        <Link to="/explore" className="text-accent underline">
                          Find a company
                        </Link>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {snapshot.pending.length ? (
              <section className="mt-8">
                <h2 className="mb-2 font-headline-sm text-lg">Still in progress</h2>
                <p className="mb-4 max-w-[65ch] text-sm text-on-surface-variant">
                  These requests are not in holdings yet. Reserved sells reduce how many shares you can offer again.
                </p>
                <ul className="flex flex-col gap-2">
                  {snapshot.pending.map((order) => (
                    <li key={order.id}>
                      <Link
                        to={`/orders/${order.id}`}
                        className="card flex min-h-11 flex-col gap-1 px-4 py-3 text-sm hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium">
                          {order.side === 'BUY' ? 'Buy' : 'Sell'} {order.quantity.toLocaleString('en-IN')} {order.company}
                        </span>
                        <span className="text-on-surface-variant">{STATUS_LABEL[order.status]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
      </QueryStatus>
    </div>
  );
}

function HoldingTableRow({ row }: { row: Holding }) {
  const navigate = useNavigate();
  return (
    <tr className="border-b border-border/70 last:border-0 hover:bg-muted/40">
      <td className="px-3 py-3">
        <Link to={`/stocks/${row.assetId}`} className="flex items-center gap-2 hover:underline">
          <CompanyLogo name={row.company} domain={row.domain} size="sm" />
          <span>
            <span className="block font-medium">{row.company}</span>
            <span className="text-xs text-on-surface-variant">
              {row.ticker} · {row.sector}
              {row.reserved ? ` · ${row.reserved.toLocaleString('en-IN')} reserved for a sale` : ''}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-3 py-3 font-mono">
        {row.quantity.toLocaleString('en-IN')}
        <span className="block text-xs text-on-surface-variant">Avg {formatInr(row.avgCost, 2)}</span>
      </td>
      <td className="px-3 py-3 font-mono">
        {formatInr(row.marketValue)}
        <span className="block text-xs text-on-surface-variant">Last {formatInr(row.lastPrice, 2)}</span>
      </td>
      <td className="px-3 py-3">
        <PnL value={row.unrealized} pct={row.unrealizedPct} />
      </td>
      <td className="px-3 py-3">
        <PnL value={row.dayPnl} pct={row.dayChangePct} />
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary min-h-11 px-3 text-xs"
            onClick={() => navigate(`/place-order?asset=${row.assetId}&side=BUY`)}
          >
            Buy more
          </button>
          <button
            type="button"
            className="btn-secondary min-h-11 px-3 text-xs"
            disabled={row.available <= 0}
            onClick={() => navigate(`/place-order?asset=${row.assetId}&side=SELL`)}
          >
            Sell
          </button>
        </div>
      </td>
    </tr>
  );
}
