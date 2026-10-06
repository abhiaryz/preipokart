import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChartLineUp, MagnifyingGlass, Newspaper, TrendUp, type Icon } from '@phosphor-icons/react';
import { api } from '../api';
import type { BlogPost, Ipo, StockListItem } from '../api/types';
import { CompanyLogo } from './ui';

const DEBOUNCE_MS = 220;
const MIN_CHARS = 2;
const MAX_PER_GROUP = 5;

type SearchResults = {
  companies: StockListItem[];
  ipos: Ipo[];
  blogs: BlogPost[];
};

function matchesQuery(haystack: string, q: string) {
  return haystack.toLowerCase().includes(q.toLowerCase());
}

export function GlobalNavSearch({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ companies: [], ipos: [], blogs: [] });
  const cacheRef = useRef<{ ipos: Ipo[] | null; blogs: BlogPost[] | null }>({ ipos: null, blogs: null });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length < MIN_CHARS) {
      setResults({ companies: [], ipos: [], blogs: [] });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [stocksRes, ipos, blogs] = await Promise.all([
          api.listStocks({ q: debounced, pageSize: 20, sort: 'name', order: 'asc' }),
          cacheRef.current.ipos
            ? Promise.resolve(cacheRef.current.ipos)
            : api.listIpos().then((res) => {
                cacheRef.current.ipos = res.data ?? [];
                return cacheRef.current.ipos;
              }),
          cacheRef.current.blogs
            ? Promise.resolve(cacheRef.current.blogs)
            : api.listBlog().then((res) => {
                cacheRef.current.blogs = res.data ?? [];
                return cacheRef.current.blogs;
              }),
        ]);

        if (cancelled) return;

        const q = debounced.toLowerCase();
        setResults({
          companies: (stocksRes.data ?? []).slice(0, MAX_PER_GROUP),
          ipos: ipos
            .filter((ipo) =>
              matchesQuery(`${ipo.name} ${ipo.legalName ?? ''} ${ipo.sector} ${ipo.status}`, q),
            )
            .slice(0, MAX_PER_GROUP),
          blogs: blogs
            .filter((post) =>
              matchesQuery(`${post.title} ${post.excerpt} ${post.category ?? ''} ${post.author}`, q),
            )
            .slice(0, MAX_PER_GROUP),
        });
      } catch {
        if (!cancelled) setResults({ companies: [], ipos: [], blogs: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const total = results.companies.length + results.ipos.length + results.blogs.length;
  const showPanel = open && query.trim().length >= MIN_CHARS;
  const empty = !loading && total === 0;

  const flatLinks = useMemo(() => {
    const items: { to: string; label: string }[] = [
      ...results.companies.map((s) => ({ to: `/stocks/${s.id}`, label: s.name })),
      ...results.ipos.map((i) => ({ to: '/ipos', label: i.name })),
      ...results.blogs.map((b) => ({ to: `/blog/${b.slug}`, label: b.title })),
    ];
    return items;
  }, [results]);

  const goFirst = () => {
    const first = flatLinks[0];
    if (!first) return;
    setOpen(false);
    setQuery('');
    navigate(first.to);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        Search companies, IPOs, and blog
      </label>
      <MagnifyingGlass
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        size={16}
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={`${inputId}-listbox`}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={compact ? 'Search…' : 'Search companies, IPOs, blog…'}
        className="field h-10 w-full py-2 pl-9 pr-3 text-sm"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            goFirst();
          }
        }}
      />

      {showPanel ? (
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[80] max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-outline-variant/50 bg-card shadow-lg"
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-on-surface-variant">Searching…</p>
          ) : empty ? (
            <p className="px-4 py-3 text-sm text-on-surface-variant">No matches for “{debounced}”</p>
          ) : (
            <div className="py-2">
              {results.companies.length > 0 ? (
                <ResultGroup title="Companies" icon={TrendUp}>
                  {results.companies.map((stock) => (
                    <ResultLink
                      key={stock.id}
                      to={`/stocks/${stock.id}`}
                      onNavigate={() => {
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <CompanyLogo name={stock.name} domain={stock.domain} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{stock.name}</span>
                        <span className="block truncate text-xs text-on-surface-variant">
                          {stock.ticker} · {stock.sector}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-data-sm text-xs ${stock.change >= 0 ? 'text-bid' : 'text-ask'}`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change}%
                      </span>
                    </ResultLink>
                  ))}
                </ResultGroup>
              ) : null}

              {results.ipos.length > 0 ? (
                <ResultGroup title="IPOs" icon={ChartLineUp}>
                  {results.ipos.map((ipo) => (
                    <ResultLink
                      key={ipo.id}
                      to="/ipos"
                      onNavigate={() => {
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <CompanyLogo name={ipo.name} domain={ipo.domain} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{ipo.name}</span>
                        <span className="block truncate text-xs text-on-surface-variant">
                          {ipo.sector} · {String(ipo.status)}
                        </span>
                      </span>
                    </ResultLink>
                  ))}
                </ResultGroup>
              ) : null}

              {results.blogs.length > 0 ? (
                <ResultGroup title="Blog" icon={Newspaper}>
                  {results.blogs.map((post) => (
                    <ResultLink
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      onNavigate={() => {
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container-low text-primary">
                        <Newspaper size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{post.title}</span>
                        <span className="block truncate text-xs text-on-surface-variant">
                          {post.category ?? 'Blog'} · {post.author}
                        </span>
                      </span>
                    </ResultLink>
                  ))}
                </ResultGroup>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: Icon;
  children: ReactNode;
}) {
  return (
    <div className="px-2 py-1">
      <p className="flex items-center gap-1.5 px-2 py-1.5 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
        <Icon size={12} aria-hidden="true" />
        {title}
      </p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function ResultLink({
  to,
  onNavigate,
  children,
}: {
  to: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <li role="option">
      <Link
        to={to}
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-high"
      >
        {children}
      </Link>
    </li>
  );
}
