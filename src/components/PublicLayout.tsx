import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, List, X } from '@phosphor-icons/react';
import { LetterMark } from './ui';
import { useAuth } from '../auth';
import AppShell from './AppShell';
import { policyNav } from '../data/policies';

const links = [
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Companies', to: '/explore' },
  { label: 'IPOs', to: '/ipos' },
  { label: 'Blog / News', to: '/blog' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact us', to: '/contact' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const companiesActive = location.pathname.startsWith('/explore') || location.pathname.startsWith('/stocks');
  const blogActive = location.pathname.startsWith('/blog');
  const iposActive = location.pathname.startsWith('/ipos');
  const faqActive = location.pathname.startsWith('/faq');
  const contactActive = location.pathname.startsWith('/contact');

  const navClass = (to: string) => {
    const active =
      (to === '/explore' && companiesActive) ||
      (to === '/blog' && blogActive) ||
      (to === '/ipos' && iposActive) ||
      (to === '/faq' && faqActive) ||
      (to === '/contact' && contactActive);
    return `btn-ghost min-h-11 px-3 ${active ? 'text-on-surface' : ''}`;
  };

  return (
    <header className="sticky top-0 z-nav border-b border-outline-variant/40 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-h-11 items-center gap-2.5 rounded-lg">
          <LetterMark label="PreIPOKart" size="sm" />
          <span className="text-sm font-semibold tracking-tight text-primary">PreIPOKart</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Page">
          {links.map(({ label, to }) => (
            <Link key={to} to={to} className={navClass(to)}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/login" className="btn-ghost hidden min-h-11 sm:inline-flex">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary hidden min-h-11 sm:inline-flex">
            Open account
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="btn-ghost min-h-11 min-w-11 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <List size={20} aria-hidden="true" />}
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="site-mobile-nav" className="border-t border-outline-variant/40 px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {links.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`${navClass(to)} justify-start`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link to="/login" className="btn-secondary min-h-11" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
            <Link to="/signup" className="btn-primary min-h-11" onClick={() => setMenuOpen(false)}>
              Open account
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/40">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_2fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LetterMark label="PreIPOKart" size="sm" />
            <span className="text-sm font-semibold tracking-tight text-primary">PreIPOKart</span>
          </Link>
          <p className="mt-3 max-w-[36ch] text-sm text-on-surface-variant">
            Dummy request book for unlisted shares in India. Not a live exchange. Unlisted equity is risky and may be illiquid.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-label-caps text-label-caps uppercase text-on-surface">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/explore" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/ipos" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  IPOs
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Blog / News
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-label-caps text-label-caps uppercase text-on-surface">Support</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Help
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-label-caps text-label-caps uppercase text-on-surface">Policies</p>
            <ul className="mt-3 space-y-2 text-sm">
              {policyNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant/40">
        <p className="mx-auto max-w-[1400px] px-4 py-4 text-xs text-on-surface-variant sm:px-6 lg:px-8">
          © 2026 PreIPOKart. Dummy policies for the marketing site — not legal advice.
        </p>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="min-h-[100dvh] bg-canvas text-on-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-modal focus:rounded-lg focus:bg-primary-container focus:px-3 focus:py-2 focus:text-on-primary-container"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export function BrowseLayout() {
  const { user } = useAuth();
  return user ? <AppShell /> : <PublicLayout />;
}
