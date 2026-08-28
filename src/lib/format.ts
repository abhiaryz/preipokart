import type { IpoStatus, OrderStatus } from '../api/types';

export function logoUrl(domain: string | null | undefined, size = 128): string {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
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

export const STATUS_LABEL: Record<OrderStatus, string> = {
  open: 'Waiting for a match',
  matched: 'Matched with a counterparty',
  holding: 'Money / shares held',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_STEPS: OrderStatus[] = ['open', 'matched', 'holding', 'completed'];

export function canCancel(status: OrderStatus, flag?: boolean) {
  if (flag != null) return flag;
  return status === 'open' || status === 'matched';
}

export function canEdit(status: OrderStatus, flag?: boolean) {
  if (flag != null) return flag;
  return status === 'open';
}

export const ipoStatusLabel: Record<IpoStatus, string> = {
  open: 'IPO open',
  upcoming: 'Upcoming',
  drhp: 'DRHP passed',
  closed: 'Closed · listing soon',
  listed: 'Recently listed',
};

export const ipoFilters: { id: 'all' | IpoStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open now' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'drhp', label: 'DRHP passed' },
  { id: 'closed', label: 'Closed / listing' },
  { id: 'listed', label: 'Recently listed' },
];

export function asIpoStatus(value: string): IpoStatus {
  if (value === 'open' || value === 'upcoming' || value === 'drhp' || value === 'closed' || value === 'listed') {
    return value;
  }
  return 'upcoming';
}

export function formatIpoDate(value: string | null | undefined) {
  if (!value) return 'TBA';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
