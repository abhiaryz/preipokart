import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import posthog, { isPostHogConfigured } from './posthog';

const STORAGE_KEY = 'preipokart-auth';

export type AuthUser = {
  email: string;
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function displayName(identifier: string) {
  if (identifier.includes('@')) {
    const local = identifier.split('@')[0] || 'Investor';
    return local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const digits = identifier.replace(/\D/g, '');
  return digits ? `Investor ${digits.slice(-4)}` : 'Investor';
}

function identifyUser(user: AuthUser) {
  if (!isPostHogConfigured) return;
  // This prototype has no user primary key, so email is the only stable identifier available.
  posthog.identify(user.email, { email: user.email, name: user.name });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const identifiedPersistedUser = useRef(false);

  useEffect(() => {
    if (user && !identifiedPersistedUser.current) {
      identifyUser(user);
      identifiedPersistedUser.current = true;
    }
  }, [user]);

  const login = useCallback((identifier: string) => {
    const isEmail = identifier.includes('@');
    const digits = identifier.replace(/\D/g, '');
    const next = {
      email: isEmail ? identifier : `${digits}@mobile.preipokart.demo`,
      name: displayName(identifier),
    };
    if (user && user.email !== next.email && isPostHogConfigured) {
      posthog.reset();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    identifyUser(next);
    identifiedPersistedUser.current = true;
    setUser(next);
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    if (isPostHogConfigured) posthog.reset();
    identifiedPersistedUser.current = false;
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
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
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to={loginPath(`${location.pathname}${location.search}`)} replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}
