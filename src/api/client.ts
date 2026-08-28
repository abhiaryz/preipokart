import type { ApiErrorBody, AuthSession } from './types';

const SESSION_KEY = 'preipokart-session';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;

  constructor(message: string, status: number, code = 'ERROR', fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type StoredSession = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number;
  user: AuthSession['user'];
};

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.accessToken && !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getStoredSession(): StoredSession | null {
  return readStoredSession();
}

export function persistSession(session: AuthSession) {
  accessToken = session.accessToken;
  refreshToken = session.refreshToken ?? refreshToken;
  const stored: StoredSession = {
    accessToken: session.accessToken,
    refreshToken: refreshToken,
    expiresAt: Date.now() + (session.expiresIn ?? 900) * 1000,
    user: session.user,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
}

export function hydrateTokensFromStorage() {
  const stored = readStoredSession();
  accessToken = stored?.accessToken ?? null;
  refreshToken = stored?.refreshToken ?? null;
  return stored;
}

export function clearSession() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('preipokart-auth');
}

function parseError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object') {
    const envelope = body as ApiErrorBody;
    if (envelope.error?.message) {
      return new ApiError(
        envelope.error.message,
        status,
        envelope.error.code || 'ERROR',
        envelope.error.fields || {},
      );
    }
    const fastapi = body as { detail?: unknown };
    if (Array.isArray(fastapi.detail) && fastapi.detail.length) {
      const first = fastapi.detail[0] as { msg?: string };
      return new ApiError(first.msg || 'Validation error', status, 'VALIDATION_ERROR');
    }
    if (typeof fastapi.detail === 'string') {
      return new ApiError(fastapi.detail, status, 'ERROR');
    }
  }
  if (status === 401) return new ApiError('Please log in again.', status, 'UNAUTHENTICATED');
  if (status === 403) return new ApiError('You cannot do that yet.', status, 'FORBIDDEN');
  if (status === 404) return new ApiError('Not found.', status, 'NOT_FOUND');
  if (status === 429) return new ApiError('Please wait before trying again.', status, 'RATE_LIMITED');
  return new ApiError('Something went wrong. Try again.', status);
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      const body = await parseBody(response);
      if (!response.ok) return false;
      const data = (body as { data?: AuthSession })?.data;
      if (!data?.accessToken) return false;
      persistSession(data);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  formData?: FormData;
  idempotency?: boolean;
  retry?: boolean;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  if (options.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options.idempotency) {
    headers['Idempotency-Key'] = crypto.randomUUID();
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
    credentials: 'include',
  });

  if (response.status === 401 && options.auth !== false && options.retry !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }
    clearSession();
  }

  const parsed = await parseBody(response);
  if (!response.ok) {
    throw parseError(response.status, parsed);
  }
  return parsed as T;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Try again.') {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
