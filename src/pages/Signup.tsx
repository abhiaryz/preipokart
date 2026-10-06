import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { AuthSplit } from '../components/AuthSplit';
import { BrandLogo, Field } from '../components/ui';
import { safeNextPath } from '../auth';
import { authClient } from '../lib/auth-client';
import posthog, { isPostHogConfigured } from '../posthog';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));
  const loginHref = `/login${searchParams.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Enter your name.');
      return;
    }
    if (!isValidEmail(email.trim()) || password.length < 8) {
      setError('Enter a valid email and a password of at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message || 'Could not create the account.');
        return;
      }
      if (isPostHogConfigured) posthog.capture('authentication_completed', { mode: 'signup', method: 'better_auth_signup' });
      navigate(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthSplit>
      <Link to="/" className="mb-5 inline-flex rounded-lg lg:hidden" aria-label="Preipokart home">
        <BrandLogo />
      </Link>
      <h1 className="font-headline-md text-[28px] tracking-tight">Create an account</h1>
      <p className="mt-2 text-on-surface-variant">Use your name, email, and a password to open an account.</p>

      {error ? (
        <p role="alert" className="mt-5 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <form className="mt-6 flex flex-col gap-5" onSubmit={(event) => void onSubmit(event)} noValidate>
        <Field id="signup-name" label="Name">
          <input
            autoComplete="name"
            className="field"
            id="signup-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field id="signup-email" label="Email">
          <input
            autoComplete="email"
            className="field"
            id="signup-email"
            type="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field id="signup-password" label="Password" hint="At least 8 characters.">
          <input
            autoComplete="new-password"
            className="field"
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <button className="btn-primary w-full cursor-pointer py-3.5" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
          {busy ? null : <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Already have an account?{' '}
        <Link to={loginHref} className="text-primary underline">
          Log in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-on-surface-variant">
        By continuing you agree to our{' '}
        <Link to="/legal/terms" className="text-primary underline">
          Terms of use
        </Link>{' '}
        and{' '}
        <Link to="/legal/privacy" className="text-primary underline">
          Privacy policy
        </Link>
        .
      </p>
    </AuthSplit>
  );
}
