import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CaretDown,
  ChartPieSlice,
  Certificate,
  CurrencyInr,
  Handshake,
  Storefront,
  type Icon,
} from '@phosphor-icons/react';
import { raiseNavLinks } from '../pages/raise/raiseContent';

const raiseIcons: Record<string, Icon> = {
  '/raise/pre-ipo-fundraising': Handshake,
  '/raise/valuations': ChartPieSlice,
  '/raise/sme-ipos': Certificate,
  '/raise/sell-business': Storefront,
};

export function RaiseNavMenu({
  className = '',
  onNavigate,
  variant = 'desktop',
}: {
  className?: string;
  onNavigate?: () => void;
  variant?: 'desktop' | 'mobile';
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const location = useLocation();
  const active = location.pathname.startsWith('/raise');

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  if (variant === 'mobile') {
    return (
      <div className={className}>
        <p
          className={`btn-ghost inline-flex items-center justify-start gap-2 px-3 font-medium ${
            active ? 'text-on-surface' : ''
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CurrencyInr size={15} weight="duotone" aria-hidden="true" />
          </span>
          Raise
        </p>
        <div className="ml-2 flex flex-col gap-1 border-l border-outline-variant/40 pl-3">
          {raiseNavLinks.map((link) => {
            const ItemIcon = raiseIcons[link.to] ?? Handshake;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={`btn-ghost inline-flex min-h-10 items-center justify-start gap-2 px-3 text-sm ${
                  location.pathname === link.to ? 'text-on-surface' : ''
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ItemIcon size={15} weight="duotone" aria-hidden="true" />
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className={`btn-ghost inline-flex min-h-11 items-center gap-2 px-3 ${active ? 'text-on-surface' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CurrencyInr size={15} weight="duotone" aria-hidden="true" />
        </span>
        Raise
        <CaretDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-[calc(100%+0.35rem)] z-[80] min-w-[17rem] rounded-xl border border-outline-variant/50 bg-card p-1.5 shadow-lg"
        >
          {raiseNavLinks.map((link) => {
            const ItemIcon = raiseIcons[link.to] ?? Handshake;
            return (
              <Link
                key={link.to}
                role="menuitem"
                to={link.to}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-container-high ${
                  location.pathname === link.to
                    ? 'bg-surface-container-low font-medium text-on-surface'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ItemIcon size={17} weight="duotone" aria-hidden="true" />
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
