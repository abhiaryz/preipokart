import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Stamp,
  Coins,
  Scales,
  Receipt,
  ChartLineUp,
  CaretDown,
} from '@phosphor-icons/react';

export const INVESTMENT_TOOLS = [
  {
    to: '/stamp-duty',
    label: 'Stamp Duty Calculator',
    description: 'State-wise stamp duty rates on unlisted share transfers',
    icon: Stamp,
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  {
    to: '/share-budget',
    label: 'Shares for Budget',
    description: 'Calculate exact share quantity for your investment amount',
    icon: Coins,
    color: 'text-blue-800 bg-blue-50 border-blue-200',
  },
  {
    to: '/break-even',
    label: 'Break-Even Calculator',
    description: 'Determine required selling price to recover fees and taxes',
    icon: Scales,
    color: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  {
    to: '/capital-gains',
    label: 'Capital Gains Tax',
    description: 'Estimate STCG & LTCG liability on unlisted equity transactions',
    icon: Receipt,
    color: 'text-purple-800 bg-purple-50 border-purple-200',
  },
  {
    to: '/roi-calculator',
    label: 'ROI Calculator',
    description: 'Forecast compound returns and target pre-IPO exit valuations',
    icon: ChartLineUp,
    color: 'text-teal-800 bg-teal-50 border-teal-200',
  },
];

export function ToolsDropdown({
  variant = 'icon',
  className = '',
}: {
  variant?: 'icon' | 'nav';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleSelect = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {variant === 'icon' ? (
        <button
          type="button"
          className="header-icon-btn flex items-center justify-center gap-1"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="true"
          title="Investment Calculators"
          aria-label="Investment Calculators"
        >
          <Calculator size={17} />
          <CaretDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          className={`btn-ghost min-h-11 px-3 inline-flex items-center gap-1.5 font-medium ${open ? 'text-[#0f4a3d]' : ''}`}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Calculator size={16} className="text-[#0f4a3d]" />
          <span>Calculators</span>
          <CaretDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
          role="menu"
          aria-label="Calculators menu"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="font-label-caps text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Investment Calculators
            </p>
            <p className="text-xs text-slate-500">Free valuation & tax modeling tools</p>
          </div>
          <div className="mt-1 space-y-1">
            {INVESTMENT_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.to}
                  type="button"
                  role="menuitem"
                  className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                  onClick={() => handleSelect(tool.to)}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tool.color}`}>
                    <Icon size={16} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{tool.label}</p>
                    <p className="line-clamp-1 text-[11px] text-slate-500">{tool.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
