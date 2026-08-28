import { getStock } from './stocks';
import { getOrders, type UserOrder } from './orders';

export interface HoldingRow {
  assetId: string;
  company: string;
  ticker: string;
  domain: string;
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
}

export interface AllocationSlice {
  sector: string;
  value: number;
  pct: number;
}

export interface PortfolioSnapshot {
  holdings: HoldingRow[];
  allocation: AllocationSlice[];
  invested: number;
  marketValue: number;
  unrealized: number;
  unrealizedPct: number;
  realized: number;
  dayPnl: number;
  escrowIn: number;
  reservedShares: number;
  pending: UserOrder[];
}

export function formatInr(n: number, digits = 0) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
}

export function formatSignedInr(n: number, digits = 0) {
  const abs = formatInr(Math.abs(n), digits);
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return abs;
}

function chronological(orders: UserOrder[]) {
  return [...orders].sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
}

export function buildPortfolio(orders = getOrders()): PortfolioSnapshot {
  const lots = new Map<string, { qty: number; cost: number }[]>();
  let realized = 0;

  const ensure = (id: string) => {
    if (!lots.has(id)) lots.set(id, []);
    return lots.get(id)!;
  };

  for (const order of chronological(orders)) {
    if (order.status !== 'completed') continue;
    if (order.side === 'BUY') {
      ensure(order.assetId).push({ qty: order.quantity, cost: order.price });
      continue;
    }
    let remaining = order.quantity;
    const book = ensure(order.assetId);
    for (const lot of book) {
      if (remaining <= 0) break;
      const take = Math.min(lot.qty, remaining);
      realized += (order.price - lot.cost) * take;
      lot.qty -= take;
      remaining -= take;
    }
  }

  const reservedByAsset = new Map<string, number>();
  for (const order of orders) {
    if (order.side !== 'SELL') continue;
    if (order.status !== 'open' && order.status !== 'matched' && order.status !== 'holding') continue;
    reservedByAsset.set(order.assetId, (reservedByAsset.get(order.assetId) || 0) + order.quantity);
  }

  const escrowIn = orders
    .filter((o) => o.side === 'BUY' && (o.status === 'matched' || o.status === 'holding'))
    .reduce((sum, o) => sum + o.total, 0);

  const pending = orders.filter(
    (o) => o.status === 'open' || o.status === 'matched' || o.status === 'holding'
  );

  const holdings: HoldingRow[] = [];

  for (const [assetId, book] of lots) {
    const quantity = book.reduce((sum, lot) => sum + lot.qty, 0);
    if (quantity <= 0) continue;
    const invested = book.reduce((sum, lot) => sum + lot.qty * lot.cost, 0);
    const stock = getStock(assetId);
    if (!stock) continue;
    const avgCost = invested / quantity;
    const marketValue = quantity * stock.price;
    const unrealized = marketValue - invested;
    const reserved = Math.min(quantity, reservedByAsset.get(assetId) || 0);
    const dayPnl = marketValue * (stock.change / 100);
    holdings.push({
      assetId,
      company: stock.name,
      ticker: stock.ticker,
      domain: stock.domain,
      sector: stock.sector,
      quantity,
      reserved,
      available: Math.max(0, quantity - reserved),
      avgCost,
      lastPrice: stock.price,
      dayChangePct: stock.change,
      invested,
      marketValue,
      unrealized,
      unrealizedPct: invested ? (unrealized / invested) * 100 : 0,
      dayPnl,
    });
  }

  holdings.sort((a, b) => b.marketValue - a.marketValue);

  const marketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const invested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const unrealized = marketValue - invested;
  const dayPnl = holdings.reduce((sum, h) => sum + h.dayPnl, 0);

  const sectorMap = new Map<string, number>();
  for (const h of holdings) {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.marketValue);
  }
  const allocation: AllocationSlice[] = [...sectorMap.entries()]
    .map(([sector, value]) => ({
      sector,
      value,
      pct: marketValue ? (value / marketValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    holdings,
    allocation,
    invested,
    marketValue,
    unrealized,
    unrealizedPct: invested ? (unrealized / invested) * 100 : 0,
    realized,
    dayPnl,
    escrowIn,
    reservedShares: holdings.reduce((sum, h) => sum + h.reserved, 0),
    pending,
  };
}
