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
