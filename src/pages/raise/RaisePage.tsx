import { FormEvent, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { Field, InlineNotice } from '../../components/ui';
import { api, errorMessage } from '../../api';
import posthog, { isPostHogConfigured } from '../../posthog';
import { getRaisePage, raiseNavLinks, type RaiseSlug } from './raiseContent';

export default function RaisePage() {
  const { slug } = useParams<{ slug: RaiseSlug }>();
  const page = getRaisePage(slug);

  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ask, setAsk] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!page) return <Navigate to="/raise/pre-ipo-fundraising" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim() || !email.trim() || !ask.trim()) {
      setError('Please fill in company, your name, email, and your ask.');
      setSent(false);
      return;
    }
    setError('');
    setBusy(true);
    try {
      await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: page.subject,
        message: [`Company: ${company.trim()}`, '', ask.trim()].join('\n'),
      });
      if (isPostHogConfigured) {
        posthog.capture('raise_lead_submitted', { raise_slug: page.slug });
      }
      setSent(true);
      setCompany('');
      setName('');
      setEmail('');
      setPhone('');
      setAsk('');
    } catch (err) {
      setSent(false);
      setError(errorMessage(err, 'Could not send your enquiry. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border border-outline-variant/40 px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="landing-how-grid absolute inset-0" />
          <div className="landing-how-glow absolute inset-0" />
        </div>
        <div className="relative z-[1] mx-auto max-w-3xl text-center">
          <p className="font-label-caps text-[11px] uppercase tracking-widest text-primary">{page.eyebrow}</p>
          <h1 className="mt-4 text-[clamp(1.85rem,3vw+0.75rem,2.85rem)] font-semibold leading-[1.1] tracking-tight">
            {page.title}
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-on-surface-variant sm:text-body-lg">
            {page.summary}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#raise-form" className="btn-primary min-h-11 px-6">
              {page.ctaLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <Link to="/contact" className="btn-secondary min-h-11 px-6">
              Contact the desk
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section>
          <h2 className="font-headline-sm text-xl tracking-tight">How it helps</h2>
          <ul className="mt-5 space-y-4">
            {page.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed text-on-surface-variant sm:text-base">
                <CheckCircle className="mt-0.5 shrink-0 text-bid" size={20} weight="fill" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <p className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">More in Raise</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {raiseNavLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`inline-flex min-h-9 items-center rounded-lg px-3 text-sm transition-colors ${
                      link.to === `/raise/${page.slug}`
                        ? 'bg-[#0F4A3D] text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="raise-form" className="scroll-mt-24">
          <form className="card flex flex-col gap-5 p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
            <div>
              <h2 className="font-headline-sm text-xl">{page.formTitle}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">We reply on working days. No spam, no public listing of your enquiry.</p>
            </div>

            {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
            {sent ? (
              <InlineNotice tone="success">Thanks. We have your enquiry and will follow up on a working day.</InlineNotice>
            ) : null}

            <Field id="raise-company" label="Company">
              <input
                className="field"
                id="raise-company"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </Field>
            <Field id="raise-name" label="Your name">
              <input
                className="field"
                id="raise-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field id="raise-email" label="Work email">
              <input
                className="field"
                id="raise-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field id="raise-phone" label="Phone" hint="Optional">
              <input
                className="field"
                id="raise-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field id="raise-ask" label={page.askLabel}>
              <textarea
                className="field min-h-32 resize-y py-3"
                id="raise-ask"
                rows={5}
                placeholder={page.askPlaceholder}
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                required
              />
            </Field>
            <button type="submit" className="btn-primary min-h-11 self-start" disabled={busy}>
              {busy ? 'Sending…' : page.ctaLabel}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
