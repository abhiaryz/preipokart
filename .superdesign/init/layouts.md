# Shared layouts

Landing (`/`) does not use a route layout. It inlines `SiteHeader` and `SiteFooter` from `PublicLayout.tsx`. Other public marketing pages use `PublicLayout` via `BrowseLayout` (falls back to `AppShell` when logged in). Authenticated app pages use `AppShell`.

## SiteHeader
- File: `src/components/PublicLayout.tsx`
- Description: Sticky 56px frosted top nav — LetterMark + PreIPOKart wordmark, How it works / Companies / IPOs / Blog / FAQ / Contact, Log in, Open account, mobile hamburger

## SiteFooter
- File: `src/components/PublicLayout.tsx`
- Description: Three-column footer (Explore, Support, Policies) plus LetterMark lockup and copyright

## PublicLayout
- File: `src/components/PublicLayout.tsx`
- Description: Skip link + SiteHeader + constrained main + SiteFooter

## BrowseLayout
- File: `src/components/PublicLayout.tsx`
- Description: Auth-aware wrapper — AppShell if logged in, else PublicLayout

## AppShell
- File: `src/components/AppShell.tsx`
- Description: Authenticated desk — 256px left rail on desktop, frosted top bar + drawer on mobile

### Full source: `src/components/PublicLayout.tsx`

```tsx
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

```

### Full source: `src/components/AppShell.tsx`

```tsx
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Bell,
  Briefcase,
  ClipboardText,
  Compass,
  List,
  ChartLineUp,
  EnvelopeSimple,
  Newspaper,
  Question,
  SealQuestion,
  SignOut,
  SquaresFour,
  UserCircle,
  X,
} from '@phosphor-icons/react';
import { LetterMark } from './ui';
import { useAuth } from '../auth';

const primaryNav = [
  { to: '/dashboard', label: 'Home', icon: SquaresFour },
  { to: '/explore', label: 'Companies', icon: Compass },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/orders', label: 'Orders', icon: ClipboardText },
];

const accountNav = [
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/ipos', label: 'IPOs', icon: ChartLineUp },
  { to: '/blog', label: 'Blog / News', icon: Newspaper },
  { to: '/faq', label: 'FAQ', icon: SealQuestion },
  { to: '/contact', label: 'Contact us', icon: EnvelopeSimple },
  { to: '/help', label: 'Help', icon: Question },
];

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <LetterMark label="PreIPOKart" size="sm" />
      <span>
        <span className="block text-sm font-semibold tracking-tight text-primary">PreIPOKart</span>
        <span className="block text-[11px] font-medium tracking-wide text-on-surface-variant">
          Pre-IPO marketplace
        </span>
      </span>
    </Link>
  );
}

function NavList({
  items,
  onNavigate,
}: {
  items: typeof primaryNav;
  onNavigate: () => void;
}) {
  const location = useLocation();
  return (
    <div className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => {
            const active =
              isActive ||
              (to === '/orders' && location.pathname.startsWith('/place-order')) ||
              (to === '/explore' && location.pathname.startsWith('/stocks')) ||
              (to === '/blog' && location.pathname.startsWith('/blog')) ||
              (to === '/faq' && location.pathname.startsWith('/faq'));
            return `flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 ${
              active
                ? 'nav-active'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`;
          }}
        >
          <Icon size={18} weight="regular" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </div>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const menu = (
    <>
      <p className="mb-2 px-3 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Browse</p>
      <NavList items={primaryNav} onNavigate={close} />
      <p className="mb-2 mt-5 px-3 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Account</p>
      <NavList items={accountNav} onNavigate={close} />
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-canvas text-on-surface">
      <header className="fixed top-0 z-nav flex h-14 w-full items-center justify-between border-b border-on-surface/10 bg-surface/90 px-4 backdrop-blur-xl md:hidden">
        <Logo />
        <button
          type="button"
          className="btn-ghost min-h-11 min-w-11"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
        </button>
      </header>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-14 z-overlay max-h-[80vh] overflow-y-auto border-b border-on-surface/10 bg-card p-4 md:hidden">
          {menu}
          <button
            type="button"
            className="btn-ghost mt-3 w-full justify-start"
            onClick={() => {
              logout();
              close();
              navigate('/');
            }}
          >
            <SignOut size={18} aria-hidden="true" />
            Log out
          </button>
        </div>
      )}

      <aside className="fixed left-0 top-0 z-nav hidden h-full w-64 flex-col border-r border-outline-variant/40 bg-surface-container-lowest px-4 py-5 md:flex">
        <Logo />
        <div className="mt-8 flex-1 overflow-y-auto">{menu}</div>
        <div className="border-t border-on-surface/10 pt-4">
          <p className="px-3 text-sm font-medium text-on-surface">{user?.name ?? 'Account'}</p>
          <p className="px-3 text-xs text-on-surface-variant">{user?.email}</p>
          <button
            type="button"
            className="btn-ghost mt-2 w-full justify-start"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <SignOut size={18} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <main className="min-h-[100dvh] pt-16 md:ml-64 md:pt-0">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

```
