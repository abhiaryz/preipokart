import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HouseSimple,
  ChartBar,
  Package,
  Vault,
  RocketLaunch,
  Newspaper,
  Question,
  EnvelopeSimple,
  SidebarSimple,
  SignOut,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../auth';
import { GlobalNavSearch } from './GlobalNavSearch';
import { HeaderAlertsDropdown } from './HeaderAlertsDropdown';
import { ToolsDropdown } from './ToolsDropdown';
import wordmark from '../assets/preipokart-wordmark.png';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Trading & Markets',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <HouseSimple size={16} /> },
      { label: 'Market Screener', path: '/explore/screener', icon: <ChartBar size={16} /> },
      { label: 'Orders Desk', path: '/orders', icon: <Package size={16} /> },
      { label: 'Portfolio', path: '/portfolio', icon: <Vault size={16} /> },
    ],
  },
  {
    label: 'Primary Markets',
    items: [
      { label: 'IPO Calendar', path: '/ipos', icon: <RocketLaunch size={16} /> },
    ],
  },
  {
    label: 'Account & Support',
    items: [{ label: 'Support', path: '/support', icon: <EnvelopeSimple size={16} /> }],
  },
];

function isMobileNav() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
}

function isNavActive(to: string, pathname: string) {
  if (to === '/orders' && pathname.startsWith('/place-order')) return true;
  if (to === '/explore/screener' && (pathname.startsWith('/explore') || pathname.startsWith('/stocks/'))) return true;
  if (to === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<'open' | 'close' | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (isMobileNav()) return false;
    return localStorage.getItem('app_sidebar_open') !== '0';
  });

  function setSidebar(next: boolean, moveFocus = false) {
    if (moveFocus) focusTarget.current = next ? 'close' : 'open';
    setSidebarOpen(next);
    if (!isMobileNav()) {
      localStorage.setItem('app_sidebar_open', next ? '1' : '0');
    }
  }

  useEffect(() => {
    if (focusTarget.current === 'close') closeBtnRef.current?.focus();
    if (focusTarget.current === 'open') openBtnRef.current?.focus();
    focusTarget.current = null;
  }, [sidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    function onChange() {
      setSidebarOpen(mq.matches ? false : localStorage.getItem('app_sidebar_open') !== '0');
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (isMobileNav()) setSidebarOpen(false);
  }, [location.pathname]);

  // Escape key closes drawer on mobile
  useEffect(() => {
    if (!sidebarOpen || !isMobileNav()) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebar(false, true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [sidebarOpen]);

  // Page title from nav item
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const currentItem =
    allItems.find((i) => isNavActive(i.path, location.pathname)) ||
    (location.pathname.startsWith('/stocks/') ? { label: 'Company Overview' } : undefined) ||
    (location.pathname.startsWith('/orders/') ? { label: 'Order Execution' } : undefined) ||
    (location.pathname.startsWith('/profile') ? { label: 'Profile & KYC' } : undefined) ||
    (location.pathname.startsWith('/faq') ? { label: 'FAQs & Helpdesk' } : undefined) ||
    (location.pathname.startsWith('/support') ? { label: 'Support desk' } : undefined);
  const pageTitle = currentItem?.label ?? 'PreIPOkart';
  const faqActive = location.pathname.startsWith('/faq');

  return (
    <div className={`app-layout${sidebarOpen ? ' sidebar-open' : ' sidebar-closed'}`}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebar(false, true)}
        />
      )}

      {/* Sidenavbar */}
      <aside
        id="app-sidebar"
        className={`sidebar${sidebarOpen ? ' open' : ' closed'}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="sidebar-logo">
          <Link to="/dashboard" aria-label="Preipokart home" className="flex items-center">
            <img src={wordmark} alt="Preipokart" className="brand-logo" />
          </Link>
          <button
            ref={closeBtnRef}
            type="button"
            className="header-icon-btn !h-7 !w-7"
            aria-label="Close sidebar"
            onClick={() => setSidebar(false, true)}
          >
            <X size={15} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Platform navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map((item) => {
                const isActive = isNavActive(item.path, location.pathname);
                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobileNav()) setSidebar(false, true);
                    }}
                    id={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => {
              navigate('/profile');
              if (isMobileNav()) setSidebar(false, true);
            }}
          >
            <div className="avatar">
              {((user?.name || user?.email || 'U').charAt(0)).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Investor Account'}</div>
              <div className="sidebar-user-role">{user?.email || 'Verified Account'}</div>
            </div>
            <button
              type="button"
              className="header-icon-btn !h-7 !w-7 !border-0 hover:!bg-black/5"
              title="Sign out"
              onClick={(e) => {
                e.stopPropagation();
                logout();
                navigate('/');
              }}
            >
              <SignOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        {/* Top header bar */}
        <header className="header">
          <button
            ref={openBtnRef}
            type="button"
            className="header-icon-btn"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            onClick={() => setSidebar(!sidebarOpen, true)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <SidebarSimple size={18} />
          </button>

          <h1 className="header-title">{pageTitle}</h1>

          <div className="header-actions">
            <GlobalNavSearch compact className="hidden sm:block" />

            {/* Tools / Calculators Dropdown */}
            <ToolsDropdown variant="icon" />

            {/* Market News / Blog Shortcut */}
            <button
              type="button"
              className="header-icon-btn"
              aria-label="Market News & Insights"
              onClick={() => navigate('/blog')}
              title="Market News & Insights"
            >
              <Newspaper size={17} />
            </button>

            <HeaderAlertsDropdown />

            <button
              type="button"
              className={`header-icon-btn${faqActive ? ' !border-[#0f4a3d] !text-[#0f4a3d] !bg-emerald-50' : ''}`}
              aria-label="FAQs and helpdesk"
              aria-current={faqActive ? 'page' : undefined}
              onClick={() => navigate('/faq')}
              title="FAQs & Helpdesk"
            >
              <Question size={17} />
            </button>

            {/* Profile & KYC */}
            <button
              type="button"
              className={`avatar !h-8 !w-8 cursor-pointer text-xs${
                location.pathname.startsWith('/profile') ? ' ring-2 ring-[#0f4a3d] ring-offset-1' : ''
              }`}
              aria-label="Profile and KYC"
              aria-current={location.pathname.startsWith('/profile') ? 'page' : undefined}
              onClick={() => navigate('/profile')}
              title="Profile & KYC"
            >
              {((user?.name || user?.email || 'U').charAt(0)).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom quick navigation tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-nav border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Mobile quick tabs"
      >
        <ul className="grid h-16 grid-cols-4">
          {[
            { to: '/dashboard', label: 'Home', icon: HouseSimple },
            { to: '/explore/screener', label: 'Screener', icon: ChartBar },
            { to: '/orders', label: 'Orders', icon: Package },
            { to: '/portfolio', label: 'Portfolio', icon: Vault },
          ].map(({ to, label, icon: Icon }) => {
            const active = isNavActive(to, location.pathname);
            return (
              <li key={to} className="min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(to)}
                  className={`flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors ${
                    active ? 'text-[#0f4a3d]' : 'text-slate-500'
                  }`}
                >
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                      active ? 'bg-[#0f4a3d]/10' : ''
                    }`}
                  >
                    <Icon size={20} weight={active ? 'bold' : 'regular'} />
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
