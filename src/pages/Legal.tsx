import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarBlank, Clock, ListBullets } from '@phosphor-icons/react';
import { getPolicy, policies, policyNav } from '../data/policies';

function sectionId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function readMinutes(sections: { body: string[] }[]) {
  const words = sections.flatMap((section) => section.body).join(' ').split(/\s+/).length;
  return Math.max(2, Math.round(words / 180));
}

export default function Legal() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const policy = getPolicy(slug);

  if (!policy) {
    return <Navigate to="/legal/terms" replace />;
  }

  const minutes = readMinutes(policy.sections);
  const index = policies.findIndex((item) => item.slug === policy.slug);
  const previous = index > 0 ? policies[index - 1] : undefined;
  const next = index >= 0 && index < policies.length - 1 ? policies[index + 1] : undefined;

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-6 text-sm text-on-surface-variant" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="underline-offset-4 hover:text-on-surface hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-on-surface-variant">Legal</span>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-on-surface">{policy.title}</li>
        </ol>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="lg:hidden">
            <label htmlFor="policy-switch" className="mb-2 block text-sm font-medium text-on-surface">
              Jump to a policy
            </label>
            <select
              id="policy-switch"
              className="field min-h-11 cursor-pointer font-sans text-base"
              value={policy.slug}
              onChange={(event) => navigate(`/legal/${event.target.value}`)}
            >
              {policies.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <nav className="card hidden p-3 lg:block" aria-label="Policies">
            <p className="px-3 pt-2 font-label-caps text-label-caps uppercase text-primary">Policies</p>
            <ul className="mt-2 space-y-1">
              {policyNav.map((item) => {
                const active = item.to === `/legal/${policy.slug}`;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm transition duration-200 ${
                        active
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <article>
          <header className="card space-y-4 p-6 sm:p-8">
            <p className="font-label-caps text-label-caps uppercase text-primary">Legal</p>
            <h1 className="max-w-[18ch] font-display-lg text-[32px] leading-[1.15] tracking-tight text-on-surface md:text-[40px]">
              {policy.title}
            </h1>
            <p className="max-w-[62ch] font-body-lg text-lg leading-relaxed text-on-surface">{policy.summary}</p>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-outline-variant/40 pt-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <CalendarBlank size={16} aria-hidden="true" />
                <dt className="sr-only">Last updated</dt>
                <dd>Updated {policy.updated}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} aria-hidden="true" />
                <dt className="sr-only">Time to read</dt>
                <dd>About {minutes} min read</dd>
              </div>
            </dl>
          </header>

          <nav className="mt-8" aria-labelledby="on-this-page">
            <h2 id="on-this-page" className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <ListBullets size={18} aria-hidden="true" />
              On this page
            </h2>
            <ol className="mt-3 flex flex-wrap gap-2">
              {policy.sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#${sectionId(section.heading)}`}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-outline-variant/45 bg-surface-container-low px-3 text-sm text-on-surface transition duration-200 hover:border-outline hover:text-primary"
                  >
                    {i + 1}. {section.heading.replace(/^\d+\.\s*/, '')}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-8 space-y-5">
            {policy.sections.map((section, i) => (
              <section
                key={section.heading}
                id={sectionId(section.heading)}
                className="card scroll-mt-24 p-6 sm:p-8"
              >
                <div className="flex gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container font-data-md text-sm text-on-primary-container"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold tracking-tight text-on-surface">
                      {section.heading.replace(/^\d+\.\s*/, '')}
                    </h2>
                    <div className="mt-4 max-w-[65ch] space-y-4 text-base leading-[1.7] text-on-surface">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 text-base leading-relaxed text-on-surface-variant">
            Dummy policy for the marketing site. It is not legal advice.{' '}
            <Link to="/contact" className="text-primary underline">
              Contact us
            </Link>{' '}
            if you have a question about a live product.
          </p>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Other policies">
            {previous ? (
              <Link
                to={`/legal/${previous.slug}`}
                className="card flex min-h-16 cursor-pointer items-center gap-3 p-4 transition duration-200 hover:border-outline"
              >
                <ArrowLeft size={18} className="shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block text-xs text-on-surface-variant">Previous</span>
                  <span className="font-medium text-on-surface">{previous.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/legal/${next.slug}`}
                className="card flex min-h-16 cursor-pointer items-center justify-end gap-3 p-4 text-right transition duration-200 hover:border-outline"
              >
                <span>
                  <span className="block text-xs text-on-surface-variant">Next</span>
                  <span className="font-medium text-on-surface">{next.title}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-primary" aria-hidden="true" />
              </Link>
            ) : null}
          </nav>
        </article>
      </div>
    </div>
  );
}
