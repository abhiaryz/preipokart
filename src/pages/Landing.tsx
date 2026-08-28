import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bank,
  Buildings,
  CaretDown,
  ChartLineUp,
  CheckCircle,
  Handshake,
  LockKey,
  Minus,
  Plus,
  ShieldCheck,
  TrendUp,
  UsersThree,
  Vault,
} from '@phosphor-icons/react';
import { CompanyLogo } from '../components/ui';
import HeroBackgroundAnimation from '../components/HeroBackgroundAnimation';
import { SiteFooter, SiteHeader } from '../components/PublicLayout';
import { stocks } from '../data/stocks';

const heroStocks = [
  stocks.find((s) => s.id === 'SWIGGY')!,
  stocks.find((s) => s.id === 'RAZORPAY')!,
  stocks.find((s) => s.id === 'OLA_ELECTRIC')!,
];

const stats = [
  { value: `${stocks.filter((s) => s.id !== 'STRIP').length}+`, label: 'Private companies' },
  { value: '₹2.4 Cr', label: 'Held in escrow' },
  { value: '48 hrs', label: 'Avg. match time' },
  { value: '100%', label: 'KYC verified trades' },
];

const trustSignals = [
  { icon: Vault, title: 'Escrow protected', body: 'Funds stay with us until both sides complete the deal.' },
  { icon: ShieldCheck, title: 'KYC before trading', body: 'Identity checks so every request comes from a verified account.' },
  { icon: ChartLineUp, title: 'Transparent book', body: 'See bids, asks, and recent activity before you place a request.' },
];

const steps = [
  {
    icon: Buildings,
    title: 'Browse companies',
    body: 'Explore private companies not yet listed on NSE or BSE, with sector, price, and implied valuation.',
  },
  {
    icon: Handshake,
    title: 'Place a buy or sell request',
    body: 'Set your price and quantity. We match your request with someone on the other side of the book.',
  },
  {
    icon: Vault,
    title: 'Settle with escrow',
    body: 'Money is held safely until the deal completes. Track every step from your dashboard.',
  },
];

const features = [
  {
    icon: TrendUp,
    title: 'Live market view',
    body: 'Home shows bids, asks, and recent trades so you can gauge how a name is moving today.',
    span: 'lg:col-span-2',
  },
  {
    icon: ShieldCheck,
    title: 'Identity check before you trade',
    body: 'Complete KYC from your profile. Both sides of every deal are verified.',
    span: '',
  },
  {
    icon: LockKey,
    title: 'Request book, not an exchange',
    body: 'A curated book for unlisted shares. Illiquid names can take longer to match.',
    span: '',
  },
  {
    icon: Bank,
    title: 'Help when you are stuck',
    body: 'In-app Help explains settlement, cancellations, and what happens if a request does not fill.',
    span: 'lg:col-span-2',
  },
];

const faqs = [
  {
    q: 'Are these companies listed on NSE or BSE?',
    a: 'No. PreIPOKart is for shares in companies that are still private. Listing on a public exchange is not guaranteed.',
  },
  {
    q: 'What if nobody takes the other side?',
    a: 'Your request can sit unmatched. You can cancel it from Place order. Illiquid names often take longer.',
  },
  {
    q: 'Is this investment advice?',
    a: 'No. We provide a place to request trades. Do your own research. Unlisted shares can lose value and may be hard to sell.',
  },
];

const sampleChartPrices = [412, 408, 415, 411, 418, 414, 421, 419, 424, 422, 426, 423, 428, 425, 429, 427, 431, 426, 424, 425.5];
const sampleChartVolume = [42, 28, 55, 38, 62, 45, 71, 52, 48, 66, 58, 44, 73, 51, 39, 67, 54, 61, 47, 59];

function SampleBookChart() {
  const featured = heroStocks[0];
  const chartW = 320;
  const chartH = 72;
  const volH = 28;
  const pad = 4;

  const minP = Math.min(...sampleChartPrices) - 2;
  const maxP = Math.max(...sampleChartPrices) + 2;
  const maxVol = Math.max(...sampleChartVolume);

  const toY = (price: number) => pad + ((maxP - price) / (maxP - minP)) * (chartH - pad * 2);
  const linePath = sampleChartPrices
    .map((p, i) => {
      const x = pad + (i / (sampleChartPrices.length - 1)) * (chartW - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${toY(p).toFixed(1)}`;
    })
    .join(' ');
  const areaPath = `${linePath} L ${chartW - pad} ${chartH} L ${pad} ${chartH} Z`;

  const bidY = toY(featured.price * 0.998);
  const askY = toY(featured.price * 1.004);

  return (
    <div className="border-b border-outline-variant/40 bg-surface-container-low/30 px-4 py-3 sm:px-5 sm:py-4">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <CompanyLogo name={featured.name} domain={featured.domain} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{featured.name}</p>
            <p className="font-data-md text-xs text-on-surface-variant">{featured.ticker} · 1D</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data-lg text-data-lg">
            ₹{featured.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-bid">+{featured.change}% today</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-outline-variant/35 bg-card/60">
        <svg viewBox={`0 0 ${chartW} ${chartH + volH + 16}`} className="h-auto w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="sample-book-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-bid) / 0.22)" />
              <stop offset="100%" stopColor="rgb(var(--color-bid) / 0)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={pad}
              y1={pad + pct * (chartH - pad * 2)}
              x2={chartW - pad}
              y2={pad + pct * (chartH - pad * 2)}
              stroke="rgb(var(--color-outline-variant) / 0.25)"
              strokeWidth="0.5"
              strokeDasharray="3 4"
            />
          ))}

          {/* Bid / ask reference lines */}
          <line
            x1={pad}
            y1={bidY}
            x2={chartW - pad}
            y2={bidY}
            stroke="rgb(var(--color-bid) / 0.35)"
            strokeWidth="0.75"
            strokeDasharray="4 3"
          />
          <line
            x1={pad}
            y1={askY}
            x2={chartW - pad}
            y2={askY}
            stroke="rgb(var(--color-ask) / 0.35)"
            strokeWidth="0.75"
            strokeDasharray="4 3"
          />

          <path d={areaPath} fill="url(#sample-book-area)" />
          <path
            d={linePath}
            fill="none"
            stroke="rgb(var(--color-bid))"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Last price dot */}
          <circle
            cx={chartW - pad}
            cy={toY(sampleChartPrices[sampleChartPrices.length - 1])}
            r="3"
            fill="rgb(var(--color-bid))"
          />
          <circle
            cx={chartW - pad}
            cy={toY(sampleChartPrices[sampleChartPrices.length - 1])}
            r="6"
            fill="rgb(var(--color-bid) / 0.2)"
          />

          {/* Volume bars */}
          {sampleChartVolume.map((vol, i) => {
            const barW = (chartW - pad * 2) / sampleChartVolume.length - 2;
            const x = pad + i * ((chartW - pad * 2) / sampleChartVolume.length) + 1;
            const h = (vol / maxVol) * (volH - 4);
            const y = chartH + 12 + (volH - h);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={Math.max(barW, 2)}
                height={h}
                fill={sampleChartPrices[i] >= (sampleChartPrices[i - 1] ?? sampleChartPrices[i]) ? 'rgb(var(--color-bid) / 0.35)' : 'rgb(var(--color-ask) / 0.35)'}
                rx="0.5"
              />
            );
          })}

          {/* Time labels */}
          {['09:30', '11:00', '13:00', '15:00'].map((label, i) => (
            <text
              key={label}
              x={pad + (i / 3) * (chartW - pad * 2)}
              y={chartH + volH + 14}
              fill="rgb(var(--color-on-surface-variant) / 0.55)"
              fontSize="8"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
            >
              {label}
            </text>
          ))}
        </svg>

        <div className="absolute right-2 top-2 flex flex-col gap-1 text-right font-data-md text-[9px]">
          <span className="text-bid/80">Bid ₹{(featured.price * 0.998).toFixed(2)}</span>
          <span className="text-ask/80">Ask ₹{(featured.price * 1.004).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-data-md text-[10px] text-on-surface-variant">
        <span>
          Vol <span className="text-on-surface/70">1.24L</span>
        </span>
        <span>
          High <span className="text-bid">₹431.00</span>
        </span>
        <span>
          Low <span className="text-ask">₹408.00</span>
        </span>
        <span>
          Spread <span className="text-on-surface/70">0.60%</span>
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary">{children}</p>
  );
}

function SectionHeading({
  label,
  title,
  description,
  className = '',
}: {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={className}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <h2 className={`font-headline-md text-[28px] tracking-tight md:text-headline-md ${label ? 'mt-3' : ''}`}>
        {title}
      </h2>
      {description ? <p className="mt-3 max-w-[55ch] text-on-surface-variant">{description}</p> : null}
    </header>
  );
}

export default function Landing() {
  const listedCompanies = stocks.filter((s) => s.id !== 'STRIP');

  return (
    <div className="min-h-[100dvh] bg-canvas text-on-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-modal focus:rounded-lg focus:bg-primary-container focus:px-3 focus:py-2 focus:text-on-primary-container"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="landing-hero relative flex min-h-[calc(100dvh-var(--header-height))] flex-col justify-center overflow-hidden">
          <HeroBackgroundAnimation />
          <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
            <div className="landing-grid absolute inset-0 opacity-[0.35]" />
            <div className="landing-hero-glow absolute left-1/2 top-0 h-[min(520px,70vh)] w-[min(720px,100vw)] -translate-x-1/2" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-canvas to-transparent sm:h-32" />
          </div>

          <div className="relative z-[2] mx-auto w-full max-w-[1400px] px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-5 lg:px-8 lg:pb-14 lg:pt-6">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12">
              <div className="animate-fade-up min-w-0">
                <p className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Unlisted equity, India
                </p>

                <h1 className="mt-3 max-w-[15ch] text-[clamp(1.875rem,4vw+0.75rem,3rem)] font-semibold leading-[1.08] tracking-tight sm:mt-4 lg:max-w-[16ch] lg:text-display-lg">
                  Buy shares in companies{' '}
                  <span className="landing-gradient-text">before they list</span>
                </h1>

                <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-on-surface-variant sm:text-body-lg">
                  Browse private companies, place a buy or sell request, and we hold funds in escrow until the deal
                  settles.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <Link to="/signup" className="btn-primary min-h-11 w-full min-w-0 px-6 sm:min-h-12 sm:w-auto sm:px-7">
                    Get started
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="btn-secondary min-h-11 w-full min-w-0 px-6 sm:min-h-12 sm:w-auto sm:px-7"
                  >
                    How it works
                    <CaretDown size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Market preview card */}
              <div className="animate-fade-up min-w-0 lg:animate-none" style={{ animationDelay: '120ms' }}>
                <div className="landing-market-card elevation-active overflow-hidden rounded-xl sm:rounded-2xl">
                  <div className="flex items-start justify-between gap-3 border-b border-outline-variant/40 px-4 py-3 sm:items-center sm:px-5 sm:py-3.5">
                    <div className="min-w-0">
                      <p className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
                        Sample request book
                      </p>
                      <p className="mt-0.5 text-[11px] text-on-surface-variant/80 sm:text-xs">
                        Illustrative, not live quotes
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-md border border-outline-variant/40 bg-surface-container-low px-2 py-1 font-data-md text-[10px] text-bid sm:text-[11px]">
                      Open
                    </span>
                  </div>

                  <SampleBookChart />

                  <div className="hidden px-5 py-2 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4 sm:text-[11px] sm:uppercase sm:tracking-wider sm:text-on-surface-variant">
                    <span>Company</span>
                    <span className="text-right">Bid</span>
                    <span className="text-right">Ask</span>
                    <span className="text-right">Change</span>
                  </div>

                  <ul className="divide-y divide-outline-variant/30">
                    {heroStocks.map((company) => {
                      const bid = company.price * 0.998;
                      const ask = company.price * 1.004;
                      return (
                        <li key={company.id}>
                          <Link
                            to={`/stocks/${company.id}`}
                            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 transition duration-200 hover:bg-on-surface/[0.03] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] sm:gap-3 sm:px-5 sm:py-3.5"
                          >
                            <CompanyLogo name={company.name} domain={company.domain} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium sm:text-base">{company.name}</p>
                              <p className="truncate text-xs text-on-surface-variant">{company.sector}</p>
                            </div>
                            <div className="hidden shrink-0 text-right font-data-md text-sm sm:block">
                              <span className="text-bid">₹{bid.toFixed(2)}</span>
                            </div>
                            <div className="hidden shrink-0 text-right font-data-md text-sm sm:block">
                              <span className="text-ask">₹{ask.toFixed(2)}</span>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-data-md text-sm sm:text-data-md">
                                ₹{company.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-bid">+{company.change}%</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex flex-col gap-2 border-t border-outline-variant/40 bg-surface-container-low/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-xs text-on-surface-variant">3 of {listedCompanies.length} companies shown</p>
                    <Link to="/explore" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      View all
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-outline-variant/40 bg-surface-container-low/50">
          <dl className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-5 border-b border-outline-variant/40 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-data-lg text-lg text-on-surface sm:text-data-lg">{stat.value}</dt>
                <dd className="mt-1 text-xs text-on-surface-variant">{stat.label}</dd>
              </div>
            ))}
          </dl>
          <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
            {trustSignals.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/40 bg-card">
                  <Icon className="text-primary" size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-headline-sm text-base">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            label="Process"
            title="How it works"
            description="Three steps from browse to settlement. No autoplay and no rotating banners."
          />

          <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div
              className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-10 hidden h-px bg-gradient-to-r from-transparent via-outline-variant/60 to-transparent md:block"
              aria-hidden="true"
            />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative">
                  <article className="card group h-full p-6 transition duration-200 hover:border-primary-container/30">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-container/30 bg-primary-container/10 font-data-md text-sm text-primary">
                        {index + 1}
                      </span>
                      <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
                        Step {index + 1}
                      </span>
                    </div>
                    <Icon
                      className="mt-5 text-primary transition duration-200 group-hover:scale-105 motion-reduce:transform-none"
                      size={28}
                      aria-hidden="true"
                    />
                    <h3 className="mt-4 font-headline-sm text-xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{step.body}</p>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Features bento */}
        <section className="border-y border-outline-variant/40 bg-surface-container-low/30">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
            <SectionHeading
              label="Platform"
              title="Built for careful first-time buyers"
              description="Everything you need to research, request, and track unlisted trades — without the noise of a public exchange."
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className={`card group p-6 transition duration-200 hover:border-primary-container/25 ${feature.span}`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-low">
                      <Icon className="text-primary" size={22} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-headline-sm text-xl">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Companies */}
        <section id="companies" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              label="Universe"
              title="Companies you can look up today"
              description="Names from the in-app list. Availability and prices change. This is not an offer to buy or sell."
            />
            <Link to="/explore" className="btn-secondary shrink-0 min-h-11">
              See the full list
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listedCompanies.map((company) => (
              <li key={company.id}>
                <Link
                  to={`/stocks/${company.id}`}
                  className="card group flex h-full flex-col gap-4 p-4 transition duration-200 hover:border-primary-container/35 hover:bg-surface-container-low/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <CompanyLogo name={company.name} domain={company.domain} size="sm" />
                    <span className="rounded-md border border-outline-variant/40 bg-surface-container-low px-2 py-0.5 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {company.sector.split(' ')[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium group-hover:text-primary">{company.name}</p>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">{company.impliedVal} implied val.</p>
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-outline-variant/30 pt-3">
                    <span className="font-data-md text-data-md">
                      ₹{company.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`font-data-md text-sm ${company.change >= 0 ? 'text-bid' : 'text-ask'}`}>
                      {company.change >= 0 ? '+' : ''}
                      {company.change}%
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-outline-variant/40 bg-surface-container-low/50">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:text-left">
            <div className="flex items-center gap-3">
              <UsersThree className="text-primary" size={32} aria-hidden="true" />
              <div>
                <p className="font-headline-sm text-lg">Trusted by everyday investors across India</p>
                <p className="mt-1 text-sm text-on-surface-variant">From first-time buyers to seasoned angels exploring pre-IPO names.</p>
              </div>
            </div>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-on-surface-variant lg:justify-end">
              {['Escrow on every trade', 'No hidden fees', 'Cancel anytime'].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckCircle className="text-bid" size={16} weight="fill" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading
              label="Support"
              title="Common questions"
              description="Quick answers before you open an account. For more detail, see the full FAQ."
            />

            <div>
              <div className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/45 bg-card/50">
                {faqs.map((item) => (
                  <details key={item.q} className="group px-5 py-1 first:pt-0 last:pb-0">
                    <summary className="cursor-pointer list-none py-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex min-h-11 items-center justify-between gap-4">
                        {item.q}
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-outline-variant/40 text-on-surface-variant transition duration-200 group-open:border-primary-container/40 group-open:bg-primary-container/10 group-open:text-primary"
                          aria-hidden="true"
                        >
                          <Plus className="group-open:hidden" size={14} />
                          <Minus className="hidden group-open:block" size={14} />
                        </span>
                      </span>
                    </summary>
                    <p className="pb-4 pr-10 text-sm leading-relaxed text-on-surface-variant">{item.a}</p>
                  </details>
                ))}
              </div>
              <Link to="/faq" className="btn-secondary mt-6 inline-flex min-h-11">
                See all FAQs
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-outline-variant/40">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
            <div className="landing-cta-card relative overflow-hidden rounded-2xl border border-outline-variant/50 p-8 md:p-12 lg:p-14">
              <div className="pointer-events-none absolute inset-0 landing-cta-glow" aria-hidden="true" />
              <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <SectionLabel>Get started</SectionLabel>
                  <h2 className="mt-3 font-headline-md text-[28px] tracking-tight md:text-headline-md">
                    Ready to look at a company?
                  </h2>
                  <p className="mt-3 text-on-surface-variant">
                    Log in with the email you signed up with, or create an account from the same screen. Browse first — no
                    commitment required.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link to="/signup" className="btn-primary min-h-12 px-8">
                    Open account
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link to="/explore" className="btn-secondary min-h-12 px-8">
                    Browse companies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
