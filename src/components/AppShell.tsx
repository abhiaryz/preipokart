import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Bell,
  BookOpenText,
  Calculator,
  Certificate,
  ChartPieSlice,
  ChartScatter,
  ChatCircleDots,
  ClipboardText,
  Handshake,
  House,
  IdentificationCard,
  Lifebuoy,
  List,
  PaperPlaneTilt,
  RocketLaunch,
  SignOut,
  Stamp,
  Storefront,
  Vault,
  X,
  type Icon,
} from '@phosphor-icons/react';
import { BrandLogo } from './ui';
import { GlobalNavSearch } from './GlobalNavSearch';
import { useAuth } from '../auth';
import { raiseNavLinks } from '../pages/raise/raiseContent';

const raiseIconByPath: Record<string, Icon> = {
  '/raise/pre-ipo-fundraising': Handshake,
  '/raise/valuations': ChartPieSlice,
  '/raise/sme-ipos': Certificate,
  '/raise/sell-business': Storefront,
};

const primaryNav = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/explore/screener', label: 'Screener', icon: ChartScatter },
  { to: '/portfolio', label: 'Portfolio', icon: Vault },
  { to: '/orders', label: 'Orders', icon: ClipboardText },
];

const raiseNav = raiseNavLinks.map((link) => ({
  to: link.to,
  label: link.label,
  icon: raiseIconByPath[link.to] ?? Handshake,
}));

const accountNav = [
  { to: '/profile', label: 'Profile', icon: IdentificationCard },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/ipos', label: 'IPOs', icon: RocketLaunch },
  { to: '/blog', label: 'Blog / News', icon: BookOpenText },
  { to: '/roi-calculator', label: 'ROI calculator', icon: Calculator },
  { to: '/stamp-duty', label: 'Stamp duty', icon: Stamp },
  { to: '/faq', label: 'FAQ', icon: ChatCircleDots },
  { to: '/contact', label: 'Contact us', icon: PaperPlaneTilt },
  { to: '/help', label: 'Help', icon: Lifebuoy },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/dashboard"
      className={`flex min-w-0 items-center ${compact ? '' : 'flex-col items-start gap-1'}`}
      aria-label="Preipokart home"
    >
      <BrandLogo className={compact ? 'h-6' : 'h-7'} />
      {compact ? null : (
        <span className="text-[11px] font-medium tracking-wide text-on-surface-variant">
          Pre-IPO marketplace
        </span>
      )}
    </Link>
  );
}

function isNavActive(to: string, pathname: string) {
  if (to === '/orders' && pathname.startsWith('/place-order')) return true;
  if (
    to === '/explore/screener' &&
    (pathname.startsWith('/explore') || pathname.startsWith('/stocks'))
  ) {
    return true;
  }
  if (to === '/blog' && pathname.startsWith('/blog')) return true;
  if (to === '/faq' && pathname.startsWith('/faq')) return true;
  if (to === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
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
      {items.map(({ to, label, icon: Icon }) => {
        const active = isNavActive(to, location.pathname);
        return (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
              active
                ? 'nav-active'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Icon size={18} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />
            {label}
          </NavLink>
        );
      })}
    </div>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const menu = (
    <>
      <p className="mb-2 px-3 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
        Browse
      </p>
      <NavList items={primaryNav} onNavigate={close} />
      <p className="mb-2 mt-5 px-3 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
        Raise
      </p>
      <NavList items={raiseNav} onNavigate={close} />
      <p className="mb-2 mt-5 px-3 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
        Account
      </p>
      <NavList items={accountNav} onNavigate={close} />
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-canvas text-on-surface">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-nav border-b border-outline-variant/40 bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center gap-2 px-3">
          <Logo compact />
          <GlobalNavSearch className="min-w-0 flex-1" compact />
          <Link
            to="/notifications"
            className="btn-ghost min-h-10 min-w-10 shrink-0"
            aria-label="Alerts"
          >
            <Bell size={20} weight="duotone" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="btn-ghost min-h-10 min-w-10 shrink-0"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer + backdrop */}
      {open ? (
        <div className="fixed inset-0 z-overlay md:hidden" id="mobile-nav-root">
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            id="mobile-nav"
            className="absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] flex max-h-[min(78dvh,36rem)] flex-col overflow-hidden rounded-b-2xl border-b border-outline-variant/40 bg-card shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="border-b border-outline-variant/30 px-4 py-3">
              <p className="truncate text-sm font-medium text-on-surface">{user?.name ?? 'Account'}</p>
              <p className="truncate text-xs text-on-surface-variant">{user?.email}</p>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-6">{menu}</div>
            <div className="border-t border-outline-variant/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                className="btn-ghost min-h-11 w-full justify-start text-error"
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
          </div>
        </div>
      ) : null}

      {/* Mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-nav border-t border-outline-variant/40 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Primary"
      >
        <ul className="grid h-16 grid-cols-4">
          {primaryNav.map(({ to, label, icon: Icon }) => {
            const active = isNavActive(to, location.pathname);
            return (
              <li key={to} className="min-w-0">
                <NavLink
                  to={to}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors ${
                    active ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                      active ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Icon size={22} weight={active ? 'fill' : 'duotone'} aria-hidden="true" />
                  </span>
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-nav hidden h-full w-64 flex-col border-r border-outline-variant/40 bg-surface-container-lowest px-4 py-5 md:flex">
        <Logo />
        <GlobalNavSearch className="mt-5" />
        <div className="mt-6 flex-1 overflow-y-auto">{menu}</div>
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

      <main className="min-h-[100dvh] pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:ml-64 md:pb-0 md:pt-0">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-5 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
