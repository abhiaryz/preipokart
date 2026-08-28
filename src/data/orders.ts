import { stocks } from './stocks';

export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'open' | 'matched' | 'holding' | 'completed' | 'cancelled';

export interface UserOrder {
  id: string;
  assetId: string;
  company: string;
  ticker: string;
  domain: string;
  side: OrderSide;
  price: number;
  quantity: number;
  fee: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  updatedAt: string;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  open: 'Waiting for a match',
  matched: 'Matched with a counterparty',
  holding: 'Money / shares held',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_STEPS: OrderStatus[] = ['open', 'matched', 'holding', 'completed'];

function isoDaysAgo(days: number, hours = 10) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 20, 0, 0);
  return d.toISOString();
}

function seed(): UserOrder[] {
  const swiggy = stocks.find((s) => s.id === 'SWIGGY')!;
  const ola = stocks.find((s) => s.id === 'OLA_ELECTRIC')!;
  const razor = stocks.find((s) => s.id === 'RAZORPAY')!;
  const pharm = stocks.find((s) => s.id === 'PHARMEASY')!;
  const retail = stocks.find((s) => s.id === 'RELIANCE_RETAIL')!;
  return [
    {
      id: 'ORD-1042',
      assetId: swiggy.id,
      company: swiggy.name,
      ticker: swiggy.ticker,
      domain: swiggy.domain,
      side: 'BUY',
      price: 422,
      quantity: 150,
      fee: 158.25,
      total: 63458.25,
      status: 'open',
      placedAt: isoDaysAgo(0, 9),
      updatedAt: isoDaysAgo(0, 9),
    },
    {
      id: 'ORD-1038',
      assetId: ola.id,
      company: ola.name,
      ticker: ola.ticker,
      domain: ola.domain,
      side: 'SELL',
      price: 146.5,
      quantity: 400,
      fee: 146.5,
      total: 58453.5,
      status: 'matched',
      placedAt: isoDaysAgo(1, 14),
      updatedAt: isoDaysAgo(0, 11),
    },
    {
      id: 'ORD-1021',
      assetId: razor.id,
      company: razor.name,
      ticker: razor.ticker,
      domain: razor.domain,
      side: 'BUY',
      price: 1240,
      quantity: 20,
      fee: 62,
      total: 24862,
      status: 'holding',
      placedAt: isoDaysAgo(4, 11),
      updatedAt: isoDaysAgo(2, 16),
    },
    {
      id: 'ORD-0988',
      assetId: pharm.id,
      company: pharm.name,
      ticker: pharm.ticker,
      domain: pharm.domain,
      side: 'SELL',
      price: 86,
      quantity: 800,
      fee: 172,
      total: 68628,
      status: 'completed',
      placedAt: isoDaysAgo(12, 10),
      updatedAt: isoDaysAgo(8, 15),
    },
    {
      id: 'ORD-0970',
      assetId: swiggy.id,
      company: swiggy.name,
      ticker: swiggy.ticker,
      domain: swiggy.domain,
      side: 'BUY',
      price: 410,
      quantity: 50,
      fee: 51.25,
      total: 20551.25,
      status: 'cancelled',
      placedAt: isoDaysAgo(15, 8),
      updatedAt: isoDaysAgo(14, 18),
    },
    {
      id: 'ORD-0840',
      assetId: razor.id,
      company: razor.name,
      ticker: razor.ticker,
      domain: razor.domain,
      side: 'BUY',
      price: 1180,
      quantity: 40,
      fee: 118,
      total: 47318,
      status: 'completed',
      placedAt: isoDaysAgo(18, 11),
      updatedAt: isoDaysAgo(14, 12),
    },
    {
      id: 'ORD-0830',
      assetId: retail.id,
      company: retail.name,
      ticker: retail.ticker,
      domain: retail.domain,
      side: 'BUY',
      price: 3080,
      quantity: 12,
      fee: 92.4,
      total: 37052.4,
      status: 'completed',
      placedAt: isoDaysAgo(22, 10),
      updatedAt: isoDaysAgo(18, 16),
    },
    {
      id: 'ORD-0820',
      assetId: pharm.id,
      company: pharm.name,
      ticker: pharm.ticker,
      domain: pharm.domain,
      side: 'BUY',
      price: 92,
      quantity: 1200,
      fee: 276,
      total: 110676,
      status: 'completed',
      placedAt: isoDaysAgo(32, 9),
      updatedAt: isoDaysAgo(28, 14),
    },
    {
      id: 'ORD-0810',
      assetId: ola.id,
      company: ola.name,
      ticker: ola.ticker,
      domain: ola.domain,
      side: 'BUY',
      price: 132,
      quantity: 800,
      fee: 264,
      total: 105864,
      status: 'completed',
      placedAt: isoDaysAgo(40, 10),
      updatedAt: isoDaysAgo(36, 15),
    },
    {
      id: 'ORD-0801',
      assetId: swiggy.id,
      company: swiggy.name,
      ticker: swiggy.ticker,
      domain: swiggy.domain,
      side: 'BUY',
      price: 398,
      quantity: 200,
      fee: 199,
      total: 79799,
      status: 'completed',
      placedAt: isoDaysAgo(48, 11),
      updatedAt: isoDaysAgo(44, 12),
    },
  ];
}

let orders = seed();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getOrders(): UserOrder[] {
  return orders;
}

export function getOrder(id: string): UserOrder | undefined {
  return orders.find((o) => o.id === id);
}

export function subscribeOrders(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addOrder(input: Omit<UserOrder, 'id' | 'placedAt' | 'updatedAt' | 'status'>): UserOrder {
  const now = new Date().toISOString();
  const seq = 1100 + orders.length;
  const order: UserOrder = {
    ...input,
    id: `ORD-${seq}`,
    status: 'open',
    placedAt: now,
    updatedAt: now,
  };
  orders = [order, ...orders];
  notify();
  return order;
}

export function cancelOrder(id: string): boolean {
  const order = orders.find((o) => o.id === id);
  if (!order || (order.status !== 'open' && order.status !== 'matched')) return false;
  orders = orders.map((o) =>
    o.id === id ? { ...o, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : o
  );
  notify();
  return true;
}

export function updateOpenOrder(id: string, price: number, quantity: number): boolean {
  const order = orders.find((o) => o.id === id);
  if (!order || order.status !== 'open') return false;
  const fee = price * quantity * 0.0025;
  const total = order.side === 'BUY' ? price * quantity + fee : price * quantity - fee;
  orders = orders.map((o) =>
    o.id === id ? { ...o, price, quantity, fee, total, updatedAt: new Date().toISOString() } : o
  );
  notify();
  return true;
}

export function canCancel(status: OrderStatus) {
  return status === 'open' || status === 'matched';
}

export function canEdit(status: OrderStatus) {
  return status === 'open';
}
