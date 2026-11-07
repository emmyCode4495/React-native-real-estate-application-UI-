import type { Property } from './data/properties';

export function money(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// "$1,250,000" or "$3,100/mo"
export function priceFull(p: Pick<Property, 'listing' | 'price'>) {
  return p.listing === 'rent' ? `${money(p.price)}/mo` : money(p.price);
}

// pin labels: "$1.25M", "$689K", "$3.1K/mo"
export function priceShort(p: Pick<Property, 'listing' | 'price'>) {
  if (p.listing === 'rent') return `$${(p.price / 1000).toFixed(1)}K/mo`;
  if (p.price >= 1_000_000) return `$${(p.price / 1_000_000).toFixed(2).replace(/0$/, '')}M`;
  return `$${Math.round(p.price / 1000)}K`;
}

export function initials(name: string) {
  const parts = name.replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[1][0] : '')).toUpperCase();
}

export function newReference() {
  return `HVN-${Math.floor(Math.random() * 900000) + 100000}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type Day = { key: string; dow: string; num: number; month: string; label: string };

// the next `count` days starting tomorrow
export function upcomingDays(count = 7): Day[] {
  const out: Day[] = [];
  const base = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, dow: DAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()], label: `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` });
  }
  return out;
}
