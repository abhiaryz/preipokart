import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bank,
  CaretDown,
  ChartLineUp,
  CheckCircle,
  LockKey,
  Minus,
  Plus,
  ShieldCheck,
  TrendUp,
  UsersThree,
  Vault,
} from '@phosphor-icons/react';
import { CompanyLogo } from '../components/ui';
import HeroChartBackground from '../components/HeroChartBackground';
import { SiteFooter, SiteHeader } from '../components/PublicLayout';
import { api } from '../api';
import type { FaqItem } from '../api/types';
import { useApi } from '../hooks/useApi';

function PopIn({
  children,
  delay = 0,
  className = '',
  lift = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  lift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'wait' | 'play' | 'done'>('wait');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState('done');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState('play');
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: '0px 0px -32px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`card-pop ${state === 'play' ? 'card-pop-play' : ''} ${state === 'done' ? 'card-pop-done' : ''} ${lift ? 'card-pop-lift' : ''} ${className}`}
      style={state === 'play' ? { animationDelay: `${delay}ms` } : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setState('done');
      }}
    >
      {children}
    </div>
  );
}

const trustSignals = [
  { icon: Vault, title: 'Escrow protected', body: 'Funds stay with us until both sides complete the deal.' },
  { icon: ShieldCheck, title: 'KYC before trading', body: 'Identity checks so every request comes from a verified account.' },
  { icon: ChartLineUp, title: 'Transparent book', body: 'See bids, asks, and recent activity before you place a request.' },
];

const steps = [
  {
    title: 'Browse companies',
    body: 'Explore private companies not yet listed on NSE or BSE, with sector, price, and implied valuation.',
    icon: '/how-it-works/browse-companies.webp?v=2',
  },
  {
    title: 'Complete KYC',
    body: 'Verify your identity from your profile. Both sides of every deal must be KYC-checked before a match.',
    icon: '/how-it-works/complete-kyc.webp?v=2',
  },
  {
    title: 'Place a buy or sell request',
    body: 'Set your price and quantity. We match your request with someone on the other side of the book.',
    icon: '/how-it-works/buy-sell.webp?v=2',
  },
  {
    title: 'Settle with escrow',
    body: 'Money is held safely until the deal completes. Track every step from your dashboard.',
    icon: '/how-it-works/escrow.webp?v=2',
  },
];

const features = [
  {
    icon: TrendUp,
    title: 'Live market view',
    body: 'Home shows bids, asks, and recent trades so you can gauge how a name is moving today.',
  },
  {
    icon: ShieldCheck,
    title: 'Identity check before you trade',
    body: 'Complete KYC from your profile. Both sides of every deal are verified.',
  },
  {
    icon: LockKey,
    title: 'Request book, not an exchange',
    body: 'A curated book for unlisted shares. Illiquid names can take longer to match.',
  },
  {
    icon: Bank,
    title: 'Help when you are stuck',
    body: 'In-app Help explains settlement, cancellations, and what happens if a request does not fill.',
  },
];

const testimonials = [
  {
    quote:
      'I could see the book, complete KYC, and place a request without guessing how settlement works. Escrow made the first trade feel safer.',
    name: 'Ananya Mehta',
    role: 'First-time pre-IPO buyer, Bengaluru',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80',
  },
  {
    quote:
      'Listing a sell request was straightforward. Matching took time on a quieter name, but every status update was clear in the dashboard.',
    name: 'Rohit Kapoor',
    role: 'Early employee, Mumbai',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&h=160&q=80',
  },
  {
    quote:
      'Finally a place that treats unlisted shares like a careful process — not a noisy exchange. The living book helped me decide when to act.',
    name: 'Priya Nair',
    role: 'Angel investor, Hyderabad',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&h=160&q=80',
  },
];

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
  const { data: stockList } = useApi(() => api.listStocks({ sort: 'change' }), []);
  const { data: publicStats } = useApi(() => api.getPublicStats(), []);
  const { data: faqList } = useApi(() => api.listFaqs(), []);
  const listedCompanies = stockList?.data ?? [];
  const landingFaqs: FaqItem[] = (faqList?.data ?? []).slice(0, 3);
  const stats = [
    { value: `${publicStats?.companyCount ?? listedCompanies.length}+`, label: 'Private companies' },
    { value: publicStats?.escrowHeldLabel ?? '—', label: 'Held in escrow' },
    { value: publicStats ? `${publicStats.avgMatchHours} hrs` : '—', label: 'Avg. match time' },
    { value: publicStats ? `${publicStats.kycVerifiedTradePct}%` : '—', label: 'KYC verified trades' },
  ];

  return (
    <div className="min-h-[100dvh] bg-canvas text-on-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-modal focus:rounded-lg focus:bg-[#0F4A3D] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="landing-hero relative flex min-h-[calc(100dvh-var(--header-height))] flex-col justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="landing-grid absolute inset-0 opacity-[0.35]" />
            <HeroChartBackground />
            <div className="landing-hero-text-glow absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-canvas to-transparent sm:h-32" />
          </div>

          <div className="relative z-[2] mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 pb-16 pt-6 text-center sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pb-24 lg:pt-10">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <p className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
                Unlisted equity, India
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-bid/25 bg-bid/10 px-2 py-0.5 font-label-caps text-[10px] uppercase tracking-wider text-bid">
                <span className="h-1.5 w-1.5 rounded-full bg-bid" />
                Live book
              </span>
            </div>

            <h1 className="mt-4 max-w-[22ch] text-[clamp(2rem,4.5vw+0.75rem,3.75rem)] font-semibold leading-[1.06] tracking-tight sm:mt-5">
              Buy shares in companies <br className="hidden sm:block" />
              <span className="landing-gradient-text">before they list</span>
            </h1>

            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-on-surface-variant sm:text-body-lg">
              Browse private companies, place a buy or sell request, and we hold funds in escrow until the deal
              settles.
            </p>

            <div className="mt-7 flex w-full flex-col gap-2.5 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
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
            {trustSignals.map(({ icon: Icon, title, body }, index) => (
              <PopIn key={title} delay={index * 90}>
              <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/40 bg-card">
                  <Icon className="text-primary" size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-headline-sm text-base">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{body}</p>
                </div>
              </div>
              </PopIn>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative overflow-hidden py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="landing-how-grid absolute inset-0" />
            <div className="landing-how-glow absolute inset-0" />
          </div>

          <div className="relative z-[1] mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <header className="mx-auto max-w-[40rem] text-center">
              <p className="font-label-caps text-[11px] uppercase tracking-widest text-primary">Process</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.5vw+0.75rem,2.75rem)] font-semibold leading-[1.1] tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-base leading-relaxed text-on-surface-variant sm:text-body-lg">
                Four steps from browse to settlement — including KYC before you trade.
              </p>
            </header>

            <ol className="relative mt-14 grid gap-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-8">
              <div
                className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[8rem] hidden h-px bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent lg:block"
                aria-hidden="true"
              />
              {steps.map((step, index) => (
                <li key={step.title} className="relative text-center">
                  <PopIn delay={index * 90} lift={false}>
                    <article>
                      <img
                        src={step.icon}
                        alt=""
                        width={384}
                        height={384}
                        className="mx-auto h-24 w-24 object-contain"
                      />
                      <span className="relative z-[1] mx-auto mt-3 flex h-10 w-10 items-center justify-center rounded-full border border-primary-container/25 bg-canvas font-data-md text-sm text-primary">
                        {index + 1}
                      </span>
                      <h3 className="mt-5 font-headline-sm text-xl tracking-tight md:text-[1.35rem]">
                        {step.title}
                      </h3>
                      <p className="mx-auto mt-2.5 max-w-[28ch] text-sm leading-relaxed text-on-surface-variant">
                        {step.body}
                      </p>
                    </article>
                  </PopIn>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Platform */}
        <section className="relative overflow-hidden border-y border-outline-variant/40 py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="landing-how-grid absolute inset-0" />
            <div className="landing-how-glow absolute inset-0" />
          </div>

          <div className="relative z-[1] mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <header className="mx-auto max-w-[42rem] text-center">
              <p className="font-label-caps text-[11px] uppercase tracking-widest text-primary">Platform</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.5vw+0.75rem,2.75rem)] font-semibold leading-[1.1] tracking-tight">
                Built for careful first-time buyers
              </h2>
              <p className="mt-4 text-base leading-relaxed text-on-surface-variant sm:text-body-lg">
                Research, request, and track unlisted trades — without exchange noise.
              </p>
            </header>

            <ul className="mt-14 grid gap-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="text-center lg:text-left">
                    <PopIn delay={(index % 4) * 80} lift={false}>
                      <article>
                        <span className="mx-auto inline-flex h-10 w-10 items-center justify-center text-primary lg:mx-0">
                          <Icon size={28} aria-hidden="true" />
                        </span>
                        <h3 className="mt-5 font-headline-sm text-xl tracking-tight md:text-[1.35rem]">
                          {feature.title}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-on-surface-variant lg:max-w-[28ch]">
                          {feature.body}
                        </p>
                      </article>
                    </PopIn>
                  </li>
                );
              })}
            </ul>
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
            {listedCompanies.map((company, index) => (
              <li key={company.id} className="h-full">
                <PopIn delay={(index % 4) * 70} className="h-full">
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
                </PopIn>
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
              <PopIn lift={false}>
              <div className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/45 bg-card/50">
                {landingFaqs.map((item) => (
                  <details key={item.id} className="group px-5 py-1 first:pt-0 last:pb-0">
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
              </PopIn>
              <Link to="/faq" className="btn-secondary mt-6 inline-flex min-h-11">
                See all FAQs
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative overflow-hidden py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="landing-how-grid absolute inset-0" />
            <div className="landing-how-glow absolute inset-0" />
          </div>

          <div className="relative z-[1] mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <header className="mx-auto max-w-[40rem] text-center">
              <p className="font-label-caps text-[11px] uppercase tracking-widest text-primary">Testimonials</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.5vw+0.75rem,2.75rem)] font-semibold leading-[1.1] tracking-tight">
                What buyers and sellers say
              </h2>
              <p className="mt-4 text-base leading-relaxed text-on-surface-variant sm:text-body-lg">
                Real voices from people researching and trading unlisted names.
              </p>
            </header>

            <ul className="mt-14 grid gap-12 md:mt-16 md:grid-cols-3 md:gap-10 lg:gap-14">
              {testimonials.map((item, index) => (
                <li key={item.name} className="text-center md:text-left">
                  <PopIn delay={index * 90} lift={false}>
                    <blockquote>
                      <p className="text-base leading-relaxed text-on-surface md:text-[1.05rem]">
                        “{item.quote}”
                      </p>
                      <footer className="mt-6 flex flex-col items-center gap-3 md:flex-row md:items-center">
                        <img
                          src={item.image}
                          alt=""
                          width={48}
                          height={48}
                          loading="lazy"
                          decoding="async"
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-outline-variant/50"
                        />
                        <div className="min-w-0">
                          <p className="font-headline-sm text-base tracking-tight">{item.name}</p>
                          <p className="mt-0.5 text-sm text-on-surface-variant">{item.role}</p>
                        </div>
                      </footer>
                    </blockquote>
                  </PopIn>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-outline-variant/40">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
            <PopIn lift={false}>
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
            </PopIn>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
