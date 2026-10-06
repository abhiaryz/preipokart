import { Link } from 'react-router-dom';
import { CardsThree, Table } from '@phosphor-icons/react';

export function ExploreViewSwitch({ active }: { active: 'cards' | 'screener' }) {
  const base =
    'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 font-label-caps text-[10px] uppercase transition-colors';
  const on = 'bg-[#0F4A3D] text-white';
  const off = 'text-on-surface-variant hover:text-on-surface';

  return (
    <div className="flex rounded-lg bg-surface-container-low p-1" role="group" aria-label="Explore view">
      <Link to="/explore" className={`${base} ${active === 'cards' ? on : off}`} aria-current={active === 'cards' ? 'page' : undefined}>
        <CardsThree size={14} aria-hidden="true" />
        Cards
      </Link>
      <Link
        to="/explore/screener"
        className={`${base} ${active === 'screener' ? on : off}`}
        aria-current={active === 'screener' ? 'page' : undefined}
      >
        <Table size={14} aria-hidden="true" />
        Screener
      </Link>
    </div>
  );
}
