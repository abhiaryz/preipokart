import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, FileText, X } from '@phosphor-icons/react';
import { useAuth } from '../auth';
import { hasApplied, pushApplication } from '../data/applications';
import type { Job } from '../data/jobs';
import { Field, InlineNotice } from './ui';
import posthog, { isPostHogConfigured } from '../posthog';

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_EXTS = new Set(['pdf', 'doc', 'docx']);

function isResumeFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (RESUME_EXTS.has(ext)) return true;
  return (
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function ApplyJobDialog({ job, onClose }: { job: Job; onClose: () => void }) {
  const { user } = useAuth();
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [note, setNote] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const already = hasApplied(job.id);

  useEffect(() => {
    nameRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const phoneDigits = digitsOnly(phone);

    if (!trimmedName || !trimmedEmail || !phoneDigits || !city.trim() || !resume) {
      setError('Fill in your name, email, phone, city, and attach a resume.');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (phoneDigits.length < 10) {
      setError('Enter a phone number with at least 10 digits.');
      return;
    }
    if (!isResumeFile(resume)) {
      setError('Resume must be a PDF or Word file.');
      return;
    }
    if (resume.size > MAX_RESUME_BYTES) {
      setError('Resume must be 5 MB or smaller.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      await pushApplication({
        jobId: job.id,
        jobTitle: job.title,
        name: trimmedName,
        email: trimmedEmail,
        phone: phone.trim(),
        city: city.trim(),
        linkedin: linkedin.trim(),
        note: note.trim(),
        file: resume,
      });
      if (isPostHogConfigured) posthog.capture('job_application_submitted', { job_id: job.id });
      setSent(true);
    } catch {
      setError('Could not save this application. Try again from this browser.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-end justify-center bg-scrim/70 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="card flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/40 px-5 py-4 sm:px-6">
          <div>
            <p className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Apply</p>
            <h2 id={titleId} className="mt-1 font-headline-sm text-xl text-on-surface">
              {job.title}
            </h2>
          </div>
          <button type="button" className="btn-ghost min-h-10 min-w-10" aria-label="Close" onClick={onClose} disabled={busy}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-8 sm:px-6">
            <InlineNotice tone="success">
              Application sent for {job.title}. Your details and resume are saved on this device. Dummy hiring flow, not a live ATS.
            </InlineNotice>
            <button type="button" className="btn-primary mt-6 min-h-11" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {already ? (
                <InlineNotice tone="info">You already sent an application for this role from this browser.</InlineNotice>
              ) : null}
              {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

              <Field id="apply-name" label="Full name">
                <input
                  ref={nameRef}
                  className="field"
                  id="apply-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field id="apply-email" label="Email">
                <input
                  className="field"
                  id="apply-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="apply-phone" label="Phone">
                  <input
                    className="field"
                    id="apply-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Field>
                <Field id="apply-city" label="City">
                  <input
                    className="field"
                    id="apply-city"
                    autoComplete="address-level2"
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field id="apply-linkedin" label="LinkedIn or portfolio" hint="Optional">
                <input
                  className="field"
                  id="apply-linkedin"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </Field>
              <Field
                id="apply-resume"
                label="Resume"
                hint={resume ? `${resume.name} · ${(resume.size / 1024).toFixed(0)} KB` : 'PDF or Word, up to 5 MB'}
              >
                <label className="field flex min-h-12 cursor-pointer items-center gap-3">
                  <FileText size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate text-sm">{resume ? 'Replace file' : 'Choose file'}</span>
                  <input
                    className="sr-only"
                    id="apply-resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    onChange={(e) => setResume(e.target.files?.[0] ?? null)}
                    required
                  />
                </label>
              </Field>
              <Field id="apply-note" label="Note" hint="Optional">
                <textarea
                  className="field min-h-24 resize-y py-3"
                  id="apply-note"
                  rows={4}
                  placeholder="Why this role, or a notice period."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-outline-variant/40 px-5 py-4 sm:px-6">
              <button type="submit" className="btn-primary min-h-11" disabled={busy}>
                {busy ? 'Sending…' : 'Submit application'}
                {busy ? null : <ArrowRight size={16} aria-hidden="true" />}
              </button>
              <button type="button" className="btn-secondary min-h-11" onClick={onClose} disabled={busy}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
