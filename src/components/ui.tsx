import { useState, type ReactNode } from 'react';
import wordmark from '../assets/preipokart-wordmark.png';
import { logoUrl } from '../lib/format';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-headline-md text-[28px] tracking-tight text-on-surface md:text-headline-md">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-[65ch] font-body-md text-body-md text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function BrandLogo({ className = 'h-7' }: { className?: string }) {
  return (
    <img src={wordmark} alt="Preipokart" className={`${className} w-auto`} />
  );
}

export function LetterMark({
  label,
  size = 'md',
}: {
  label: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const letter = (label.replace(/[^A-Za-z]/g, '')[0] || 'P').toUpperCase();
  const box = size === 'sm' ? 'h-8 w-8 text-sm' : size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg';
  return (
    <span
      aria-hidden="true"
      className={`flex ${box} items-center justify-center rounded-lg border border-primary-container/20 bg-primary-container font-semibold tracking-tight text-on-primary-container`}
    >
      {letter}
    </span>
  );
}

export function CompanyLogo({
  name,
  domain,
  size = 'md',
}: {
  name: string;
  domain?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);
  const box = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  const px = size === 'sm' ? 64 : size === 'lg' ? 128 : 96;
  const src = logoUrl(domain, px);

  if (failed || !src) {
    return <LetterMark label={name} size={size} />;
  }

  return (
    <img
      src={src}
      alt=""
      width={px}
      height={px}
      className={`${box} rounded-lg border border-outline-variant/50 bg-card object-contain p-1.5`}
      onError={() => setFailed(true)}
    />
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label mb-0" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-body-md text-sm text-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="font-body-md text-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

export function InlineNotice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success';
  children: ReactNode;
}) {
  const tones = {
    info: 'border-primary-container/30 bg-primary-container/10 text-on-surface-variant',
    error: 'border-error/30 bg-error-container/20 text-error',
    success: 'border-secondary-container/30 bg-secondary-container/10 text-secondary-container',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 font-body-md text-sm ${tones[tone]}`} role="status">
      {children}
    </div>
  );
}

export function QueryStatus({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error?: string | null;
  children?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-on-surface-variant" role="status">
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="elevation-widget rounded-xl px-6 py-12 text-center" role="alert">
        <p className="font-headline-sm text-lg text-on-surface">Could not load this page</p>
        <p className="mt-2 font-body-md text-on-surface-variant">{error}</p>
      </div>
    );
  }
  return <>{children}</>;
}
