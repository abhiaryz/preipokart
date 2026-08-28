import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, MagnifyingGlass } from '@phosphor-icons/react';
import { QueryStatus } from '../components/ui';
import { api } from '../api';
import { useApi } from '../hooks/useApi';

export default function Faq() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const { data, error, loading } = useApi(() => api.listFaqs({ q: query, category }), [query, category]);
  const items = data?.data ?? [];
  const categories = [{ id: 'all', label: 'All' }, ...(data?.meta.categories ?? [])];

  const grouped = useMemo(() => {
    const order = categories.filter((c) => c.id !== 'all');
    return order
      .map((tab) => ({
        id: tab.id,
        label: tab.label,
        items: items.filter((item) => item.category === tab.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, items]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="font-label-caps text-label-caps uppercase text-primary">Support</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">FAQ</h1>
        <p className="mt-2 max-w-[65ch] font-body-md text-body-md text-on-surface-variant">
          Straight answers about unlisted shares, matching, fees, and KYC.
        </p>
      </header>

      <div className="mb-6">
        <label htmlFor="faq-search" className="mb-2 block text-sm font-medium text-on-surface">
          Search questions
        </label>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            aria-hidden="true"
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “fee”, “KYC”, or “sell”"
            className="field min-h-11 pl-10"
          />
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="FAQ topics">
        {categories.map((tab) => {
          const pressed = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setCategory(tab.id)}
              className={`min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 text-sm font-medium transition duration-200 ${
                pressed
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <QueryStatus loading={loading && !data} error={error}>
        {grouped.length === 0 ? (
          <p className="card p-6 text-sm text-on-surface-variant" role="status">
            No questions match “{query}”. Try another word, or{' '}
            <button type="button" className="cursor-pointer text-primary underline" onClick={() => setQuery('')}>
              clear search
            </button>
            .
          </p>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <section key={group.id} aria-labelledby={`faq-${group.id}`}>
                <h2 id={`faq-${group.id}`} className="mb-3 font-headline-sm text-lg text-on-surface">
                  {group.label}
                </h2>
                <div className="divide-y divide-outline-variant/40 overflow-hidden rounded-xl border border-outline-variant/45">
                  {group.items.map((item) => (
                    <details key={item.id} id={item.id} className="group bg-card open:bg-surface-container-low">
                      <summary className="cursor-pointer list-none px-5 py-1 marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex min-h-11 items-center justify-between gap-4 py-3 font-medium text-on-surface">
                          {item.q}
                          <CaretDown
                            size={18}
                            className="shrink-0 text-on-surface-variant transition duration-200 group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </span>
                      </summary>
                      <p className="max-w-[65ch] px-5 pb-4 text-sm leading-relaxed text-on-surface-variant">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </QueryStatus>

      <aside className="card mt-10 space-y-3 p-6">
        <h2 className="font-headline-sm text-lg text-on-surface">Still stuck?</h2>
        <p className="text-sm text-on-surface-variant">
          Open in-app Help after you log in, or finish KYC so we can match your requests.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/help" className="btn-secondary min-h-11 cursor-pointer">
            Help centre
          </Link>
          <Link to="/login" className="btn-primary min-h-11 cursor-pointer">
            Log in
          </Link>
        </div>
      </aside>
    </div>
  );
}
