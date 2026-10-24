import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldWarning, Clock, ArrowRight } from '@phosphor-icons/react';
import { useAuth } from '../auth';

// 15 minutes total timeout; warning dialog triggered at 14 minutes
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_WINDOW_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 5 * 1000;

export function InactivityGuard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const throttleRef = useRef<number>(0);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    // Throttle activity event recordings to once per second
    if (now - throttleRef.current > 1000) {
      lastActivityRef.current = now;
      throttleRef.current = now;
      if (isWarningOpen) {
        setIsWarningOpen(false);
      }
    }
  }, [isWarningOpen]);

  const handleStaySignedIn = () => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
  };

  const handleLogoutNow = useCallback(async () => {
    setIsWarningOpen(false);
    await logout();
    const currentPath = `${location.pathname}${location.search}`;
    navigate(`/login?reason=timeout&next=${encodeURIComponent(currentPath)}`, { replace: true });
  }, [logout, location, navigate]);

  useEffect(() => {
    if (!user) {
      setIsWarningOpen(false);
      return;
    }

    // Reset timestamp on user change/login
    lastActivityRef.current = Date.now();

    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleEvent = () => recordActivity();

    activityEvents.forEach((ev) => {
      window.addEventListener(ev, handleEvent, { passive: true });
    });

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Inactivity exceeded, auto-lockout
        window.clearInterval(intervalId);
        void handleLogoutNow();
      } else if (elapsed >= IDLE_TIMEOUT_MS - WARNING_WINDOW_MS) {
        // In warning zone
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);
        setIsWarningOpen(true);
      } else {
        setIsWarningOpen(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, handleEvent);
      });
      window.clearInterval(intervalId);
    };
  }, [user, recordActivity, handleLogoutNow]);

  if (!user || !isWarningOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-guard-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldWarning size={28} weight="duotone" />
          </div>
          <div>
            <h2 id="inactivity-guard-title" className="font-headline-sm text-lg text-on-surface">
              Session Inactivity Alert
            </h2>
            <p className="text-xs text-on-surface-variant">Institutional Session Security</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
          For your account and financial security, your session has been idle and will automatically lock in:
        </p>

        <div className="my-5 flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 py-3">
          <Clock size={20} className="text-amber-500" />
          <span className="font-mono text-2xl font-bold tracking-tight text-amber-500">
            {secondsRemaining}s
          </span>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => void handleLogoutNow()}
            className="btn-ghost inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Log Out Now
          </button>
          <button
            type="button"
            onClick={handleStaySignedIn}
            className="btn-primary inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm"
          >
            <span>Stay Signed In</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
