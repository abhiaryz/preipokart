import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LetterMark } from './ui';

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-[100dvh] bg-canvas text-on-surface lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-on-surface/10 px-12 py-16 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgb(var(--color-on-surface) / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-on-surface) / 0.06) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary-container/20 blur-[120px]" />
        </div>
        <Link to="/" className="relative z-10 flex items-center gap-3 rounded-lg">
          <LetterMark label="PreIPOKart" />
          <span className="font-headline-sm text-xl tracking-tight text-primary">PreIPOKart</span>
        </Link>
        <div className="relative z-10 max-w-lg">
          <h1 className="font-display-lg text-[40px] leading-[1.12] tracking-tight text-on-surface lg:text-display-lg">
            Buy shares in companies before they list on the stock market
          </h1>
          <p className="mt-5 max-w-[40ch] font-body-lg text-body-lg text-on-surface-variant">
            Browse well-known private companies, place a buy or sell request, and we hold the money safely until the deal is done.
          </p>
        </div>
        <p className="relative z-10 text-sm text-on-surface-variant">Trusted by everyday investors across India</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 md:px-10">
        <div className="elevation-active w-full max-w-[420px] rounded-xl p-7 md:p-8">{children}</div>
      </section>
    </div>
  );
}
