import { FormEvent, useState } from 'react';
import { Clock, EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react';
import { Field, InlineNotice, PageHeader, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import { useApi } from '../hooks/useApi';
import posthog, { isPostHogConfigured } from '../posthog';

export default function Contact() {
  const { data: office, error: officeError, loading } = useApi(() => api.getOffice(), []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
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
        subject: subject.trim() || 'Website enquiry',
        message: message.trim(),
      });
      if (isPostHogConfigured) posthog.capture('contact_message_submitted');
      setSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setSent(false);
      setError(errorMessage(err, 'Could not send your message. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Contact us"
        description="Write to the PreIPOKart desk in Bengaluru. We reply on working days during the hours below."
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <form className="card flex flex-col gap-5 p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
          <h2 className="font-headline-sm text-xl">Send a message</h2>
          {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
          {sent ? (
            <InlineNotice tone="success">Thanks. We have your note and will reply on a working day.</InlineNotice>
          ) : null}

          <Field id="contact-name" label="Name">
            <input
              className="field"
              id="contact-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field id="contact-email" label="Email">
            <input
              className="field"
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field id="contact-phone" label="Phone" hint="Optional">
            <input
              className="field"
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field id="contact-subject" label="Subject">
            <input
              className="field"
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Website enquiry"
            />
          </Field>
          <Field id="contact-message" label="Message">
            <textarea
              className="field min-h-32 resize-y py-3"
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </Field>
          <button type="submit" className="btn-primary min-h-11 self-start" disabled={busy}>
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <QueryStatus loading={loading} error={officeError}>
          {office ? (
            <div className="flex flex-col gap-6">
              <section className="card p-5 sm:p-6">
                <h2 className="flex items-center gap-2 font-headline-sm text-xl">
                  <Clock size={22} className="text-primary" aria-hidden="true" />
                  Office hours
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Desk support follows Indian working days. Orders still settle on the book even when the office is closed.
                </p>
                <dl className="mt-4 divide-y divide-outline-variant/40">
                  {office.hours.map((row) => (
                    <div key={row.day} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                      <dt className="text-on-surface-variant">{row.day}</dt>
                      <dd className="font-medium">{row.time}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Phone size={16} className="shrink-0 text-primary" aria-hidden="true" />
                    <a className="text-primary underline-offset-4 hover:underline" href={`tel:${office.phone.replace(/\s/g, '')}`}>
                      {office.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <EnvelopeSimple size={16} className="shrink-0 text-primary" aria-hidden="true" />
                    <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${office.email}`}>
                      {office.email}
                    </a>
                  </li>
                </ul>
              </section>

              <section className="card overflow-hidden p-0">
                <div className="p-5 sm:p-6">
                  <h2 className="flex items-center gap-2 font-headline-sm text-xl">
                    <MapPin size={22} className="text-primary" aria-hidden="true" />
                    Office location
                  </h2>
                  <address className="mt-2 not-italic text-sm text-on-surface-variant">
                    {office.line1}
                    <br />
                    {office.line2}
                    <br />
                    {office.city}
                  </address>
                  {office.mapsQuery ? (
                    <a
                      className="mt-3 inline-flex text-sm text-primary underline-offset-4 hover:underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.mapsQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  ) : null}
                </div>
                {office.mapEmbedUrl ? (
                  <iframe
                    title="Map to PreIPOKart office"
                    src={office.mapEmbedUrl}
                    className="h-72 w-full border-t border-outline-variant/40 bg-surface-container-low"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : null}
              </section>
            </div>
          ) : null}
        </QueryStatus>
      </div>
    </div>
  );
}
