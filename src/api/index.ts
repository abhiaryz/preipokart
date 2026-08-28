import { request, type ApiError } from './client';
import type {
  AuthMe,
  AuthSession,
  BlogPost,
  ChartData,
  ChartRange,
  ContactOffice,
  DematOverview,
  Envelope,
  FaqItem,
  Ipo,
  Job,
  KycStatus,
  LegalNavItem,
  LegalPolicy,
  ListResult,
  MarketsOverview,
  Nominee,
  Notification,
  Order,
  OrderBook,
  OrderSide,
  OrderStatus,
  OtpChallenge,
  Portfolio,
  PublicStats,
  StockDetail,
  StockListItem,
  UserProfile,
} from './types';

function unwrap<T>(envelope: Envelope<T>): T {
  return envelope.data;
}

function list<T>(envelope: { data: T[]; meta?: ListResult<T>['meta'] }): ListResult<T> {
  return { data: envelope.data ?? [], meta: envelope.meta ?? {} };
}

export const api = {
  health: () => request<{ status: string }>('/health', { auth: false }),

  signupOtp: (body: { channel: 'email' | 'mobile'; email?: string; mobile?: string }) =>
    request<Envelope<OtpChallenge>>('/v1/auth/signup/otp', { method: 'POST', body, auth: false }).then(unwrap),

  resendOtp: (challengeId: string) =>
    request<Envelope<OtpChallenge>>('/v1/auth/signup/otp/resend', {
      method: 'POST',
      body: { challengeId },
      auth: false,
    }).then(unwrap),

  verifySignup: (challengeId: string, otp: string) =>
    request<Envelope<AuthSession>>('/v1/auth/signup/verify', {
      method: 'POST',
      body: { challengeId, otp },
      auth: false,
    }).then(unwrap),

  login: (email: string, password: string) =>
    request<Envelope<AuthSession>>('/v1/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }).then(unwrap),

  googleOauth: (idToken: string) =>
    request<Envelope<AuthSession>>('/v1/auth/oauth/google', {
      method: 'POST',
      body: { idToken },
      auth: false,
    }).then(unwrap),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<null>('/v1/auth/password/change', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  logout: () => request<null>('/v1/auth/logout', { method: 'POST' }),

  me: () => request<Envelope<AuthMe>>('/v1/auth/me').then(unwrap),

  getProfile: () => request<Envelope<UserProfile>>('/v1/users/me').then(unwrap),

  updateProfile: (body: {
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
    city?: string | null;
    dateOfBirth?: string | null;
  }) => request<Envelope<UserProfile>>('/v1/users/me', { method: 'PATCH', body }).then(unwrap),

  getKyc: async () => {
    try {
      return await request<Envelope<KycStatus>>('/v1/kyc').then(unwrap);
    } catch (err) {
      if ((err as ApiError).status === 404) {
        return { status: 'unverified' } satisfies KycStatus;
      }
      throw err;
    }
  },

  submitKyc: (pan: string, aadhaar: string) =>
    request<Envelope<KycStatus>>('/v1/kyc', { method: 'POST', body: { pan, aadhaar } }).then(unwrap),

  getNominee: async () => {
    try {
      return await request<Envelope<Nominee>>('/v1/users/me/nominee').then(unwrap);
    } catch (err) {
      if ((err as ApiError).status === 404) return null;
      throw err;
    }
  },

  setNominee: (body: Nominee) =>
    request<Envelope<Nominee>>('/v1/users/me/nominee', { method: 'PUT', body }).then(unwrap),

  getDemat: () => request<Envelope<DematOverview>>('/v1/users/me/demat').then(unwrap),

  connectCdsl: (dpId: string, boId: string) =>
    request<Envelope<{ connected: boolean }>>('/v1/users/me/demat/cdsl', {
      method: 'POST',
      body: { dpId, boId },
    }).then(unwrap),

  disconnectCdsl: () => request<null>('/v1/users/me/demat/cdsl', { method: 'DELETE' }),

  connectNsdl: (dpId: string, clientId: string) =>
    request<Envelope<{ connected: boolean }>>('/v1/users/me/demat/nsdl', {
      method: 'POST',
      body: { dpId, clientId },
    }).then(unwrap),

  disconnectNsdl: () => request<null>('/v1/users/me/demat/nsdl', { method: 'DELETE' }),

  listStocks: (params: { q?: string; sector?: string; sort?: string; order?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.sector && params.sector !== 'All') query.set('sector', params.sector);
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    query.set('pageSize', '50');
    const suffix = query.toString() ? `?${query}` : '';
    return request<{ data: StockListItem[]; meta?: ListResult<StockListItem>['meta'] }>(
      `/v1/markets/stocks${suffix}`,
      { auth: false },
    ).then(list);
  },

  getStock: (id: string) =>
    request<Envelope<StockDetail>>(`/v1/markets/stocks/${encodeURIComponent(id)}`, { auth: false }).then(unwrap),

  getStockChart: (id: string, range: ChartRange) =>
    request<Envelope<ChartData>>(
      `/v1/markets/stocks/${encodeURIComponent(id)}/chart?range=${encodeURIComponent(range)}`,
      { auth: false },
    ).then(unwrap),

  getOverview: (q?: string) => {
    const suffix = q ? `?q=${encodeURIComponent(q)}` : '';
    return request<Envelope<MarketsOverview>>(`/v1/markets/overview${suffix}`).then(unwrap);
  },

  getOrderBook: (id: string) =>
    request<Envelope<OrderBook>>(`/v1/markets/stocks/${encodeURIComponent(id)}/book`, { auth: false }).then(unwrap),

  listOrders: (params: { side?: OrderSide | 'all'; status?: OrderStatus | 'all'; q?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.side && params.side !== 'all') query.set('side', params.side);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.q) query.set('q', params.q);
    query.set('pageSize', '50');
    const suffix = query.toString() ? `?${query}` : '';
    return request<{ data: Order[]; meta?: ListResult<Order>['meta'] }>(`/v1/orders${suffix}`).then(list);
  },

  getOrder: (id: string) =>
    request<Envelope<Order>>(`/v1/orders/${encodeURIComponent(id)}`).then(unwrap),

  placeOrder: (body: {
    assetId: string;
    side: OrderSide;
    price: number;
    quantity: number;
    acceptedTerms: boolean;
  }) =>
    request<Envelope<Order>>('/v1/orders', { method: 'POST', body, idempotency: true }).then(unwrap),

  updateOrder: (id: string, body: { price?: number; quantity?: number }) =>
    request<Envelope<Order>>(`/v1/orders/${encodeURIComponent(id)}`, { method: 'PATCH', body }).then(unwrap),

  cancelOrder: (id: string) =>
    request<Envelope<{ id: string; status: string; updatedAt: string }>>(
      `/v1/orders/${encodeURIComponent(id)}/cancel`,
      { method: 'POST' },
    ).then(unwrap),

  getPortfolio: () => request<Envelope<Portfolio>>('/v1/portfolio').then(unwrap),

  listNotifications: () =>
    request<{ data: Notification[]; meta?: ListResult<Notification>['meta'] }>('/v1/notifications').then(list),

  markNotificationRead: (id: string) =>
    request<null>(`/v1/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),

  markAllNotificationsRead: () => request<null>('/v1/notifications/read-all', { method: 'POST' }),

  listIpos: (status?: string) => {
    const suffix = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ data: Ipo[]; meta?: ListResult<Ipo>['meta'] }>(`/v1/ipos${suffix}`, { auth: false }).then(list);
  },

  listBlog: () =>
    request<{ data: BlogPost[]; meta?: ListResult<BlogPost>['meta'] }>('/v1/blog', { auth: false }).then(list),

  getBlog: (slug: string) =>
    request<Envelope<BlogPost>>(`/v1/blog/${encodeURIComponent(slug)}`, { auth: false }).then(unwrap),

  listFaqs: (params: { q?: string; category?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    const suffix = query.toString() ? `?${query}` : '';
    return request<{ data: FaqItem[]; meta?: ListResult<FaqItem>['meta'] }>(`/v1/faqs${suffix}`, {
      auth: false,
    }).then(list);
  },

  listHelp: () =>
    request<{ data: FaqItem[]; meta?: ListResult<FaqItem>['meta'] }>('/v1/help', { auth: false }).then(list),

  listLegal: () =>
    request<{ data: LegalNavItem[]; meta?: ListResult<LegalNavItem>['meta'] }>('/v1/legal', { auth: false }).then(
      list,
    ),

  getLegal: (slug: string) =>
    request<Envelope<LegalPolicy>>(`/v1/legal/${encodeURIComponent(slug)}`, { auth: false }).then(unwrap),

  getOffice: () => request<Envelope<ContactOffice>>('/v1/contact/office', { auth: false }).then(unwrap),

  submitContact: (body: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    request<Envelope<{ id?: string }>>('/v1/contact', { method: 'POST', body, auth: false }).then(unwrap),

  listJobs: (team?: string) => {
    const suffix = team && team !== 'all' ? `?team=${encodeURIComponent(team)}` : '';
    return request<{ data: Job[]; meta?: ListResult<Job>['meta'] }>(`/v1/jobs${suffix}`, { auth: false }).then(list);
  },

  checkJobApplication: (id: string, email?: string) => {
    const suffix = email ? `?email=${encodeURIComponent(email)}` : '';
    return request<Envelope<{ applied: boolean }>>(
      `/v1/jobs/${encodeURIComponent(id)}/application${suffix}`,
      { auth: false },
    ).then(unwrap);
  },

  applyForJob: (id: string, form: FormData) =>
    request<Envelope<{ id?: string }>>(`/v1/jobs/${encodeURIComponent(id)}/applications`, {
      method: 'POST',
      formData: form,
      auth: false,
    }).then(unwrap),

  getPublicStats: () => request<Envelope<PublicStats>>('/v1/stats/public', { auth: false }).then(unwrap),
};

export { ApiError, errorMessage } from './client';
export type * from './types';
