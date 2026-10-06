import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from '@phosphor-icons/react';

const CONSENT_KEY = 'preipokart-consent-v1';

type ConsentState = {
  acceptedAt: string;
  cookies: true;
  terms: true;
};

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed?.cookies && parsed?.terms && parsed?.acceptedAt) return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!readConsent());
  }, []);

  const accept = () => {
    const payload: ConsentState = {
      acceptedAt: new Date().toISOString(),
      cookies: true,
      terms: true,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-outline-variant/50 bg-card/95 p-4 shadow-[0_-8px_30px_rgb(0_0_0/0.08)] backdrop-blur-xl sm:p-5"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie size={22} weight="duotone" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p id="consent-title" className="font-headline-sm text-base tracking-tight">
              Cookies &amp; terms
            </p>
            <p id="consent-desc" className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              We use cookies to keep you signed in and improve the site. By continuing, you accept our{' '}
              <Link to="/legal/terms" className="font-medium text-primary underline-offset-2 hover:underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link to="/legal/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Link to="/legal/privacy" className="btn-secondary min-h-11 justify-center px-5">
            Learn more
          </Link>
          <button type="button" className="btn-primary min-h-11 justify-center px-6" onClick={accept}>
            Accept &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
}
