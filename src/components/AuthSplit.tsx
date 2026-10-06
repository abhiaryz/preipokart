import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './ui';

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-[100dvh] overflow-hidden bg-canvas text-on-surface lg:grid-cols-[1.05fr_0.95fr]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
        <div className="auth-orb auth-orb-c" />
        <div className="auth-grid" />
        <span className="auth-mark auth-mark-1" />
        <span className="auth-mark auth-mark-2" />
        <span className="auth-mark auth-mark-3" />
      </div>
      <section className="relative z-10 hidden overflow-hidden border-r border-on-surface/10 px-12 py-16 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="relative z-10 inline-flex rounded-lg" aria-label="Preipokart home">
          <BrandLogo className="h-8" />
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

      <section className="relative z-10 flex min-h-[100dvh] items-center justify-center px-6 py-10 md:px-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </section>
    </div>
  );
}
