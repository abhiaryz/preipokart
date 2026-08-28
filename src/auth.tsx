import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api, errorMessage } from './api';
import { clearSession, hydrateTokensFromStorage, persistSession } from './api/client';
import type { AuthSession, SessionUser } from './api/types';
import posthog, { isPostHogConfigured } from './posthog';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  mobile?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  applySession: (session: AuthSession) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  applySession: () => {},
  logout: async () => {},
});

function toAuthUser(user: SessionUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name?.trim() || user.email.split('@')[0] || 'Investor',
    mobile: user.mobile,
  };
}

function identifyUser(user: AuthUser) {
  if (!isPostHogConfigured) return;
  posthog.identify(user.id, { email: user.email, name: user.name });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const identified = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const stored = hydrateTokensFromStorage();

    const bootstrap = async () => {
      if (!stored?.accessToken && !stored?.refreshToken) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await api.me();
        if (cancelled) return;
        const next = toAuthUser(me);
        setUser(next);
        identifyUser(next);
        identified.current = true;
      } catch {
        clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((session: AuthSession) => {
    persistSession(session);
    const next = toAuthUser(session.user);
    if (user && user.id !== next.id && isPostHogConfigured) {
      posthog.reset();
    }
    identifyUser(next);
    identified.current = true;
    setUser(next);
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Session is cleared locally either way.
    }
    clearSession();
    if (isPostHogConfigured) posthog.reset();
    identified.current = false;
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, applySession, logout }), [user, ready, applySession, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function safeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard';
  return next;
}

export function loginPath(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-on-surface-variant" role="status">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to={loginPath(`${location.pathname}${location.search}`)} replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}

export { errorMessage };
