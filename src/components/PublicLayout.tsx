import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenText,
  ChartScatter,
  ChatCircleDots,
  List,
  PaperPlaneTilt,
  RocketLaunch,
  X,
  type Icon,
} from '@phosphor-icons/react';
import { BrandLogo } from './ui';
import { GlobalNavSearch } from './GlobalNavSearch';
import { RaiseNavMenu } from './RaiseNavMenu';
import { api } from '../api';
import { useAuth } from '../auth';
import { useApi } from '../hooks/useApi';
import AppShell from './AppShell';
import { raiseNavLinks } from '../pages/raise/raiseContent';

const links: Array<{ label: string; to: string; icon: Icon }> = [
  { label: 'Screener', to: '/explore/screener', icon: ChartScatter },
  { label: 'IPOs', to: '/ipos', icon: RocketLaunch },
  { label: 'Blog / News', to: '/blog', icon: BookOpenText },
  { label: 'FAQ', to: '/faq', icon: ChatCircleDots },
  { label: 'Contact us', to: '/contact', icon: PaperPlaneTilt },
];

function NavIconLink({
  to,
  label,
  icon: IconCmp,
  className,
  onClick,
}: {
  to: string;
  label: string;
  icon: Icon;
  className: string;
  onClick?: () => void;
}) {
  return (
    <Link to={to} className={`${className} inline-flex items-center gap-2`} onClick={onClick}>
      <IconCmp size={16} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const screenerActive = location.pathname.startsWith('/explore') || location.pathname.startsWith('/stocks');
  const blogActive = location.pathname.startsWith('/blog');
  const iposActive = location.pathname.startsWith('/ipos');
  const faqActive = location.pathname.startsWith('/faq');
  const contactActive = location.pathname.startsWith('/contact');

  const navClass = (to: string) => {
    const active =
      (to === '/explore/screener' && screenerActive) ||
      (to === '/blog' && blogActive) ||
      (to === '/ipos' && iposActive) ||
      (to === '/faq' && faqActive) ||
      (to === '/contact' && contactActive);
    return `btn-ghost min-h-11 px-3 ${active ? 'text-on-surface' : ''}`;
  };

  return (
    <header className="sticky top-0 z-nav border-b border-outline-variant/40 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-h-11 shrink-0 items-center rounded-lg" aria-label="Preipokart home">
          <BrandLogo />
        </Link>

        <GlobalNavSearch className="mx-1 w-full max-w-md flex-1" compact />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Page">
          {links.slice(0, 2).map(({ label, to, icon }) => (
            <NavIconLink key={to} to={to} label={label} icon={icon} className={navClass(to)} />
          ))}
          <RaiseNavMenu />
          {links.slice(2).map(({ label, to, icon }) => (
            <NavIconLink key={to} to={to} label={label} icon={icon} className={navClass(to)} />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link to="/login" className="btn-ghost hidden min-h-11 sm:inline-flex">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary hidden min-h-11 sm:inline-flex">
            Open account
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="btn-ghost min-h-11 min-w-11 xl:hidden"
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
        <nav id="site-mobile-nav" className="border-t border-outline-variant/40 px-4 py-3 xl:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {links.slice(0, 2).map(({ label, to, icon }) => (
              <NavIconLink
                key={to}
                to={to}
                label={label}
                icon={icon}
                className={`${navClass(to)} justify-start`}
                onClick={() => setMenuOpen(false)}
              />
            ))}
            <RaiseNavMenu variant="mobile" onNavigate={() => setMenuOpen(false)} />
            {links.slice(2).map(({ label, to, icon }) => (
              <NavIconLink
                key={to}
                to={to}
                label={label}
                icon={icon}
                className={`${navClass(to)} justify-start`}
                onClick={() => setMenuOpen(false)}
              />
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
  const { data } = useApi(() => api.listLegal(), []);
  const policyNav = (data?.data ?? []).map((item) => ({ to: `/legal/${item.slug}`, label: item.title }));

  return (
    <footer className="border-t border-outline-variant/40">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_2fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center" aria-label="Preipokart home">
            <BrandLogo />
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
                <Link to="/explore/screener" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  Screener
                </Link>
              </li>
              <li>
                <Link to="/ipos" className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                  IPOs
                </Link>
              </li>
              {raiseNavLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-modal focus:rounded-lg focus:bg-[#0F4A3D] focus:px-3 focus:py-2 focus:text-white"
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
