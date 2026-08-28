import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Envelope, GoogleLogo, Phone } from '@phosphor-icons/react';
import { Field, InlineNotice, LetterMark } from './ui';
import { safeNextPath, useAuth } from '../auth';
import posthog, { isPostHogConfigured } from '../posthog';

export const DEMO_OTP = '123456';

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
  const { login } = useAuth();
  const next = safeNextPath(searchParams.get('next'));

  const [channel, setChannel] = useState<Channel>('email');
  const [step, setStep] = useState<Step>('identify');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isSignup = mode === 'signup';
  const fieldPrefix = mode;
  const identifier = channel === 'email' ? email.trim() : mobile.replace(/\s/g, '');
  const maskedTarget =
    channel === 'email'
      ? identifier.replace(/(^.).*(@.*$)/, '$1•••$2')
      : `+91 ••••••${identifier.slice(-4)}`;

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

  const sendOtp = () => {
    setError('');
    setFieldError('');
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
    setStep('otp');
    setOtp(['', '', '', '', '', '']);
    setResendIn(30);
    setInfo(`Demo OTP sent to ${channel === 'email' ? email.trim() : `+91 ${identifier}`}. Use ${DEMO_OTP}.`);
    window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    return true;
  };

  const fillOtp = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6).split('');
    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < 6; i += 1) nextDigits[i] = digits[i] ?? '';
    setOtp(nextDigits);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const finishAuth = (identifierOverride?: string) => {
    const method = identifierOverride ? 'google' : channel === 'email' ? 'email_otp' : 'mobile_otp';
    login(identifierOverride ?? (channel === 'email' ? email.trim() : `+91${identifier}`));
    if (isPostHogConfigured) posthog.capture('authentication_completed', { mode, method });
    navigate(next);
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
              ? 'Sign up with Google, or get a 6-digit OTP on email or mobile.'
              : 'Log in with Google, or get a 6-digit OTP on email or mobile.'
            : `Enter the 6-digit code sent to ${maskedTarget}.`}
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
        <form
          className="flex flex-col gap-5"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            sendOtp();
          }}
          noValidate
        >
          <button
            type="button"
            className="btn-secondary min-h-12 w-full cursor-pointer"
            onClick={() => finishAuth('google.user@gmail.com')}
          >
            <GoogleLogo size={18} weight="bold" aria-hidden="true" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant" role="separator">
            <span className="h-px flex-1 bg-outline-variant/50" />
            Or with OTP
            <span className="h-px flex-1 bg-outline-variant/50" />
          </div>

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
                  aria-describedby={fieldError ? `${fieldPrefix}-email-error` : undefined}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Field>
          ) : (
            <Field
              id={`${fieldPrefix}-mobile`}
              label="Mobile number"
              error={fieldError}
              hint="Indian 10-digit number. We will send an SMS OTP in a live product."
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
                  aria-describedby={fieldError ? `${fieldPrefix}-mobile-error` : undefined}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </Field>
          )}

          <button className="btn-primary mt-1 w-full cursor-pointer py-3.5" type="submit">
            Send 6-digit OTP
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            const code = otp.join('');
            if (code.length !== 6) {
              showError('Enter the 6-digit OTP. You can paste it from your messages or email.');
              return;
            }
            if (code !== DEMO_OTP) {
              showError(`That code does not match. For this demo, use ${DEMO_OTP}. Paste is allowed.`);
              return;
            }
            finishAuth();
          }}
          noValidate
        >
          {info ? <InlineNotice tone="info">{info}</InlineNotice> : null}

          <fieldset>
            <legend className="label mb-2">One-time password</legend>
            <p className="mb-3 text-sm text-on-surface-variant">Paste is allowed. Demo code is {DEMO_OTP}.</p>
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

          <button className="btn-primary w-full cursor-pointer py-3.5" type="submit">
            {isSignup ? 'Verify and create account' : 'Verify and log in'}
            <ArrowRight size={18} aria-hidden="true" />
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
              disabled={resendIn > 0}
              onClick={() => sendOtp()}
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
        . Google sign-in is a demo and does not call Google.
      </p>
    </>
  );
}
