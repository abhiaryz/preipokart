import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Envelope, GoogleLogo, Phone } from '@phosphor-icons/react';
import { Field, InlineNotice, LetterMark } from './ui';
import { api, errorMessage } from '../api';
import { safeNextPath, useAuth } from '../auth';
import posthog, { isPostHogConfigured } from '../posthog';

type Channel = 'email' | 'mobile';
type Step = 'identify' | 'otp';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value.replace(/\s/g, ''));
}

export function OtpAuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { applySession } = useAuth();
  const next = safeNextPath(searchParams.get('next'));

  const [channel, setChannel] = useState<Channel>('email');
  const [step, setStep] = useState<Step>('identify');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [challengeId, setChallengeId] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isSignup = mode === 'signup';
  const fieldPrefix = mode;
  const identifier = channel === 'email' ? email.trim() : mobile.replace(/\s/g, '');

  const otherHref = `${isSignup ? '/login' : '/signup'}${
    searchParams.get('next') ? `?next=${encodeURIComponent(next)}` : ''
  }`;

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const showError = (message: string) => {
    setError(message);
    window.requestAnimationFrame(() => errorRef.current?.focus());
  };

  const finishAuth = (session: Parameters<typeof applySession>[0], method: string) => {
    applySession(session);
    if (isPostHogConfigured) posthog.capture('authentication_completed', { mode, method });
    navigate(next);
  };

  const sendOtp = async (resend = false) => {
    setError('');
    setFieldError('');
    if (!resend) {
      if (channel === 'email' && !isValidEmail(email.trim())) {
        setFieldError('Enter a valid email address.');
        showError('There is a problem with your email.');
        return false;
      }
      if (channel === 'mobile' && !isValidMobile(mobile)) {
        setFieldError('Enter a 10-digit Indian mobile number starting with 6–9.');
        showError('There is a problem with your mobile number.');
        return false;
      }
    }
    setBusy(true);
    try {
      const challenge = resend
        ? await api.resendOtp(challengeId)
        : await api.signupOtp(
            channel === 'email'
              ? { channel: 'email', email: email.trim() }
              : { channel: 'mobile', mobile: identifier },
          );
      setChallengeId(challenge.challengeId);
      setMaskedTarget(challenge.maskedTarget);
      setStep('otp');
      if (!resend) setOtp(['', '', '', '', '', '']);
      setResendIn(challenge.resendInSeconds || 30);
      setInfo(`OTP sent to ${challenge.maskedTarget}.`);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return true;
    } catch (err) {
      showError(errorMessage(err, 'Could not send OTP. Try again.'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const fillOtp = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6).split('');
    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < 6; i += 1) nextDigits[i] = digits[i] ?? '';
    setOtp(nextDigits);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const onPasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email.trim()) || password.length < 8) {
      showError('Enter a valid email and a password of at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const session = await api.login(email.trim(), password);
      finishAuth(session, 'password');
    } catch (err) {
      showError(errorMessage(err, 'Could not log in. Check your email and password.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link to="/" className="mb-5 flex items-center gap-3 rounded-lg lg:hidden">
          <LetterMark label="PreIPOKart" size="sm" />
          <span className="text-sm font-semibold tracking-tight text-primary">PreIPOKart</span>
        </Link>
        <h1 className="font-headline-md text-[28px] tracking-tight text-on-surface">
          {isSignup ? 'Create an account' : 'Log in'}
        </h1>
        <p className="mt-2 text-on-surface-variant">
          {step === 'identify'
            ? isSignup
              ? 'Get a 6-digit OTP on email or mobile to create your account.'
              : 'Log in with email and password, or get a 6-digit OTP.'
            : `Enter the 6-digit code sent to ${maskedTarget || 'you'}.`}
        </p>
      </div>

      {error ? (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby={`${mode}-error-title`}
          className="mb-5 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error"
        >
          <p id={`${mode}-error-title`} className="font-medium">
            There is a problem
          </p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {step === 'identify' ? (
        <div className="flex flex-col gap-5">
          <button
            type="button"
            className="btn-secondary min-h-12 w-full cursor-pointer"
            disabled={busy}
            onClick={() => showError('Google sign-in is not configured in this environment.')}
          >
            <GoogleLogo size={18} weight="bold" aria-hidden="true" />
            Continue with Google
          </button>

          {!isSignup ? (
            <form className="flex flex-col gap-5" onSubmit={onPasswordLogin} noValidate>
              <Field id={`${fieldPrefix}-email`} label="Email" error={fieldError}>
                <div className="relative">
                  <Envelope
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    size={16}
                    aria-hidden="true"
                  />
                  <input
                    autoComplete="email"
                    className="field pl-10"
                    id={`${fieldPrefix}-email`}
                    type="email"
                    inputMode="email"
                    placeholder="you@email.com"
                    value={email}
                    aria-invalid={Boolean(fieldError)}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </Field>
              <Field id={`${fieldPrefix}-password`} label="Password">
                <input
                  autoComplete="current-password"
                  className="field"
                  id={`${fieldPrefix}-password`}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <button className="btn-primary w-full cursor-pointer py-3.5" type="submit" disabled={busy}>
                {busy ? 'Logging in…' : 'Log in'}
                {busy ? null : <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </form>
          ) : null}

          <div className="flex items-center gap-3 text-xs text-on-surface-variant" role="separator">
            <span className="h-px flex-1 bg-outline-variant/50" />
            {isSignup ? 'Or with OTP' : 'Or log in with OTP'}
            <span className="h-px flex-1 bg-outline-variant/50" />
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void sendOtp();
            }}
            noValidate
          >
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="OTP channel">
              {(['email', 'mobile'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={channel === id}
                  className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium transition duration-200 ${
                    channel === id
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => {
                    setChannel(id);
                    setFieldError('');
                    setError('');
                  }}
                >
                  {id === 'email' ? <Envelope size={16} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
                  {id === 'email' ? 'Email' : 'Mobile'}
                </button>
              ))}
            </div>

            {channel === 'email' ? (
              isSignup ? (
                <Field id={`${fieldPrefix}-otp-email`} label="Email" error={fieldError}>
                  <div className="relative">
                    <Envelope
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                      size={16}
                      aria-hidden="true"
                    />
                    <input
                      autoComplete="email"
                      className="field pl-10"
                      id={`${fieldPrefix}-otp-email`}
                      type="email"
                      inputMode="email"
                      placeholder="you@email.com"
                      value={email}
                      aria-invalid={Boolean(fieldError)}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </Field>
              ) : null
            ) : (
              <Field
                id={`${fieldPrefix}-mobile`}
                label="Mobile number"
                error={fieldError}
                hint="Indian 10-digit number. We will send an SMS OTP."
              >
                <div className="flex gap-2">
                  <span className="field flex min-h-11 w-[4.5rem] shrink-0 items-center justify-center px-0 text-sm">+91</span>
                  <input
                    autoComplete="tel-national"
                    className="field min-w-0 flex-1"
                    id={`${fieldPrefix}-mobile`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobile}
                    aria-invalid={Boolean(fieldError)}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </Field>
            )}

            {channel === 'email' && !isSignup ? (
              <p className="text-sm text-on-surface-variant">We’ll send the OTP to {email.trim() || 'the email above'}.</p>
            ) : null}

            <button className="btn-secondary mt-1 w-full cursor-pointer py-3.5" type="submit" disabled={busy}>
              Send 6-digit OTP
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            const code = otp.join('');
            if (code.length !== 6) {
              showError('Enter the 6-digit OTP. You can paste it from your messages or email.');
              return;
            }
            setBusy(true);
            setError('');
            try {
              const session = await api.verifySignup(challengeId, code);
              finishAuth(session, channel === 'email' ? 'email_otp' : 'mobile_otp');
            } catch (err) {
              showError(errorMessage(err, 'That code did not work. Try again or resend.'));
            } finally {
              setBusy(false);
            }
          }}
          noValidate
        >
          {info ? <InlineNotice tone="info">{info}</InlineNotice> : null}

          <fieldset>
            <legend className="label mb-2">One-time password</legend>
            <p className="mb-3 text-sm text-on-surface-variant">Paste is allowed.</p>
            <div
              className="flex justify-between gap-2"
              onPaste={(e) => {
                e.preventDefault();
                fillOtp(e.clipboardData.getData('text'));
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  className="field h-12 w-11 px-0 text-center font-data-md text-lg sm:w-12"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  aria-label={`Digit ${index + 1} of 6`}
                  value={digit}
                  onChange={(e) => {
                    const char = e.target.value.replace(/\D/g, '').slice(-1);
                    const nextOtp = [...otp];
                    nextOtp[index] = char;
                    setOtp(nextOtp);
                    if (char && index < 5) otpRefs.current[index + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>
          </fieldset>

          <button className="btn-primary w-full cursor-pointer py-3.5" type="submit" disabled={busy}>
            {busy ? 'Verifying…' : isSignup ? 'Verify and create account' : 'Verify and log in'}
            {busy ? null : <ArrowRight size={18} aria-hidden="true" />}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              className="btn-ghost min-h-11 cursor-pointer px-0"
              onClick={() => {
                setStep('identify');
                setOtp(['', '', '', '', '', '']);
                setError('');
                setInfo('');
              }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Change {channel === 'email' ? 'email' : 'number'}
            </button>
            <button
              type="button"
              className="btn-ghost min-h-11 cursor-pointer px-0 disabled:opacity-50"
              disabled={resendIn > 0 || busy}
              onClick={() => void sendOtp(true)}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link to={otherHref} className="text-primary underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link to={otherHref} className="text-primary underline">
              Create an account
            </Link>
          </>
        )}
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
    </>
  );
}
