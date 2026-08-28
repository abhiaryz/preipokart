export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'open' | 'matched' | 'holding' | 'completed' | 'cancelled';
export type ChartRange = '1D' | '1W' | '1M' | '1Y';
export type IpoStatus = 'open' | 'upcoming' | 'drhp' | 'closed' | 'listed';
export type NomineeRelationship = 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Other';

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
  meta?: { requestId?: string };
};

export type Envelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ListMeta = {
  requestId?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  sectors?: string[];
  categories?: { id: string; label: string }[];
  teams?: { id: string; label: string }[];
  unreadCount?: number;
  openCount?: number;
};

export type ListResult<T> = {
  data: T[];
  meta: ListMeta;
};

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  mobile?: string | null;
};

export type AuthSession = {
  user: SessionUser;
  accessToken: string;
  expiresIn?: number;
  refreshToken?: string | null;
};

export type AuthMe = SessionUser & {
  kycStatus?: string;
  nomineeOnFile?: boolean;
  cdslConnected?: boolean;
  nsdlConnected?: boolean;
};

export type OtpChallenge = {
  challengeId: string;
  channel: string;
  maskedTarget: string;
  expiresInSeconds: number;
  resendInSeconds: number;
};

export type UserProfile = AuthMe & {
  city?: string | null;
  dateOfBirth?: string | null;
};

export type KycStatus = {
  status: string;
  panLast4?: string | null;
  aadhaarLast4?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
};

export type Nominee = {
  name: string;
  relationship: NomineeRelationship;
  sharePercent?: number;
  dateOfBirth: string;
  mobile: string;
  pan?: string | null;
};

export type DematAccount = {
  connected?: boolean;
  dpId?: string | null;
  boIdLast4?: string | null;
  clientIdLast4?: string | null;
};

export type DematOverview = {
  cdsl: DematAccount;
  nsdl: DematAccount;
};

export type StockListItem = {
  id: string;
  name: string;
  legalName?: string | null;
  ticker: string;
  sector: string;
  change: number;
  price: number;
  impliedVal?: string | null;
  lockup?: string | null;
  series?: string | null;
  domain?: string | null;
};

export type StockDocument = {
  title: string;
  type: string;
  date: string;
  url?: string | null;
  href?: string | null;
};

export type StockFinancial = {
  year: string;
  revenueCr: number;
  ebitdaCr: number;
  patCr: number;
  employees: number;
};

export type StockDetail = StockListItem & {
  description?: string | null;
  founded?: string | null;
  headquarters?: string | null;
  cin?: string | null;
  website?: string | null;
  employees?: string | null;
  lastFunding?: string | null;
  documents?: StockDocument[];
  financials?: StockFinancial[];
};

export type ChartPoint = {
  t: string;
  price: number;
  volume: number;
};

export type ChartData = {
  range: string;
  currency?: string;
  points: ChartPoint[];
};

export type OverviewBookItem = {
  id: string;
  name: string;
  domain?: string | null;
  sector: string;
  lastClearing?: number | null;
  bestBid?: number | null;
  bestAsk?: number | null;
  status?: string;
};

export type MarketsOverview = {
  takeaway: string;
  bidVolumeCr: number;
  matchEfficiencyPct: number;
  book: OverviewBookItem[];
};

export type OrderBookLevel = {
  price: number;
  quantity: number;
  participants: number;
};

export type OrderBook = {
  assetId: string;
  lastPrice: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

export type Order = {
  id: string;
  assetId: string;
  company: string;
  ticker: string;
  domain?: string | null;
  side: OrderSide;
  price: number;
  quantity: number;
  fee: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  updatedAt: string;
  canEdit?: boolean;
  canCancel?: boolean;
};

export type Holding = {
  assetId: string;
  company: string;
  ticker: string;
  domain?: string | null;
  sector: string;
  quantity: number;
  reserved: number;
  available: number;
  avgCost: number;
  lastPrice: number;
  dayChangePct: number;
  invested: number;
  marketValue: number;
  unrealized: number;
  unrealizedPct: number;
  dayPnl: number;
};

export type AllocationSlice = {
  sector: string;
  value: number;
  pct: number;
};

export type Portfolio = {
  invested: number;
  marketValue: number;
  unrealized: number;
  unrealizedPct: number;
  realized: number;
  dayPnl: number;
  escrowIn: number;
  reservedShares: number;
  holdings: Holding[];
  allocation: AllocationSlice[];
  pending: Order[];
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string | null;
};

export type Ipo = {
  id: string;
  name: string;
  legalName?: string | null;
  sector: string;
  exchange?: string | null;
  status: IpoStatus | string;
  issueType?: string;
  priceBand?: string | null;
  lotSize?: number | null;
  issueSize?: string | null;
  openDate?: string | null;
  closeDate?: string | null;
  listingDate?: string | null;
  drhpDate?: string | null;
  sebiStatus?: string | null;
  gmp?: string | null;
  subscription?: string | null;
  registrar?: string | null;
  leadManagers?: string | null;
  domain?: string | null;
  note?: string | null;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date?: string | null;
  publishedAt: string;
  publishedTime?: string | null;
  readMinutes?: number;
  category?: string;
  author: string;
  authorRole?: string | null;
  authorImage?: string | null;
  cover?: string | null;
  inlineImage?: string | null;
  body?: string[];
};

export type FaqItem = {
  id: string;
  category: string;
  q: string;
  a: string;
};

export type LegalNavItem = {
  slug: string;
  title: string;
};

export type LegalPolicy = {
  slug: string;
  title: string;
  updated?: string | null;
  summary?: string | null;
  sections: { heading: string; body: string[] }[];
};

export type OfficeHours = {
  day: string;
  time: string;
};

export type ContactOffice = {
  line1: string;
  line2?: string | null;
  city: string;
  phone: string;
  email: string;
  mapsQuery?: string | null;
  mapEmbedUrl?: string | null;
  hours: OfficeHours[];
};

export type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  posted?: string | null;
  summary: string;
  work?: string[];
};

export type PublicStats = {
  companyCount: number;
  escrowHeldLabel: string;
  avgMatchHours: number;
  kycVerifiedTradePct: number;
};
