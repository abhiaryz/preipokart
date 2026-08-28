import { api } from '../api';
import type { StockListItem } from '../api/types';
import { useApi } from '../hooks/useApi';

const quantMetrics = [
  { label: 'VWAP', value: '₹418.20' },
  { label: 'σ', value: '1.24' },
  { label: 'β', value: '1.08' },
  { label: 'RSI', value: '62.4' },
  { label: 'OI Δ', value: '+12.3%' },
  { label: 'P/E', value: '18.4×' },
];

function seededNoise(seed: string, index: number): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 10000;
  }
  return (hash / 10000) * 2 - 1;
}

function buildSparklinePath(id: string, change: number, width: number, height: number): string {
  const steps = 14;
  let y = height * 0.55;
  const drift = change >= 0 ? -0.35 : 0.35;
  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width;
    y += seededNoise(id, i) * 6 + drift;
    y = Math.max(height * 0.12, Math.min(height * 0.88, y));
    points.push([x, y]);
  }

  return points.map(([x, py], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`).join(' ');
}

const panelLayout = [
  { left: '10%', top: '16%', width: 140, height: 48 },
  { left: '30%', top: '44%', width: 140, height: 48 },
  { left: '50%', top: '16%', width: 140, height: 48 },
  { left: '70%', top: '44%', width: 140, height: 48 },
];

const quantPositions = [
  { top: '18%', left: '6%' },
  { top: '32%', right: '8%' },
  { top: '58%', left: '12%' },
  { top: '72%', right: '14%' },
];

export default function HeroBackgroundAnimation() {
  const { data } = useApi(() => api.listStocks({ sort: 'change' }), []);
  const listedStocks: StockListItem[] = data?.data ?? [];
  const chartPanels = listedStocks.slice(0, 4).map((stock, index) => ({
    stock,
    ...(panelLayout[index] ?? panelLayout[0]),
  }));

  return (
    <div className="landing-hero-animation pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0">
        {quantMetrics.slice(0, quantPositions.length).map((metric, index) => {
          const pos = quantPositions[index];
          return (
            <div
              key={metric.label}
              className="landing-quant-label absolute hidden font-data-md opacity-40 sm:block"
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
              }}
            >
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant/50">{metric.label}</span>
              <span className="mt-0.5 block text-sm text-on-surface/40">{metric.value}</span>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0">
        {chartPanels.map(({ stock, left, top, width, height }) => {
          const path = buildSparklinePath(stock.id, stock.change, width, height);
          const up = stock.change >= 0;

          return (
            <div key={stock.id} className="absolute hidden opacity-40 md:block" style={{ left, top }}>
              <div className="rounded-lg border border-outline-variant/20 bg-card/30 px-2.5 py-2 backdrop-blur-[2px]">
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/45">
                  {stock.ticker}
                </p>
                <svg viewBox={`0 0 ${width} ${height}`} className="mt-1 h-10 w-[120px]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`grad-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={up ? 'rgb(var(--color-bid) / 0.25)' : 'rgb(var(--color-ask) / 0.25)'} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#grad-${stock.id})`} />
                  <path
                    d={path}
                    fill="none"
                    stroke={up ? 'rgb(var(--color-bid) / 0.45)' : 'rgb(var(--color-ask) / 0.45)'}
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <div className="landing-hero-animation-mask absolute inset-0" />
    </div>
  );
}
