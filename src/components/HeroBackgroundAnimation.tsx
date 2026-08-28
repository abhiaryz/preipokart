import { stocks } from '../data/stocks';

const listedStocks = stocks.filter((s) => s.id !== 'STRIP');

const quantMetrics = [
  { label: 'VWAP', value: '₹418.20' },
  { label: 'σ', value: '1.24' },
  { label: 'β', value: '1.08' },
  { label: 'RSI', value: '62.4' },
  { label: 'OI Δ', value: '+12.3%' },
  { label: 'P/E', value: '18.4×' },
  { label: 'VOL', value: '2.4M' },
  { label: 'SPREAD', value: '0.62%' },
  { label: 'Δ IV', value: '+4.2%' },
  { label: 'Z-SCORE', value: '1.31' },
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

function buildCandleBars(id: string, count: number, height: number) {
  return Array.from({ length: count }, (_, i) => {
    const noise = seededNoise(id, i + 100);
    const body = 8 + Math.abs(noise) * 14;
    const wick = body + 4 + Math.abs(seededNoise(id, i + 200)) * 8;
    const bullish = seededNoise(id, i + 300) > 0;
    return { body, wick, bullish };
  });
}

const chartPanels = listedStocks.slice(0, 5).map((stock, index) => ({
  stock,
  left: `${8 + index * 18}%`,
  top: `${12 + (index % 3) * 22}%`,
  width: 140,
  height: 48,
  delay: `${index * 0.8}s`,
}));

const quantPositions = [
  { top: '18%', left: '6%', delay: '0s' },
  { top: '32%', right: '8%', delay: '1.2s' },
  { top: '58%', left: '12%', delay: '2.4s' },
  { top: '72%', right: '14%', delay: '0.6s' },
  { top: '44%', left: '42%', delay: '1.8s' },
  { top: '26%', right: '28%', delay: '3s' },
];

function TickerChip({
  ticker,
  name,
  price,
  change,
}: {
  ticker: string;
  name: string;
  price: number;
  change: number;
}) {
  const up = change >= 0;
  return (
    <span className="landing-ticker-chip inline-flex shrink-0 items-center gap-2.5 rounded-md border border-outline-variant/25 bg-surface-container-low/40 px-3 py-1.5 backdrop-blur-sm">
      <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{ticker}</span>
      <span className="text-xs text-on-surface-variant/70">{name}</span>
      <span className="font-data-md text-xs text-on-surface/80">
        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
      <span className={`font-data-md text-xs ${up ? 'text-bid' : 'text-ask'}`}>
        {up ? '+' : ''}
        {change}%
      </span>
    </span>
  );
}

function TickerRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...listedStocks, ...listedStocks];
  return (
    <div className="landing-ticker-row overflow-hidden">
      <div
        className={`landing-ticker-track flex w-max gap-3 ${reverse ? 'landing-ticker-reverse' : 'landing-ticker-forward'}`}
      >
        {items.map((stock, index) => (
          <TickerChip
            key={`${stock.id}-${index}`}
            ticker={stock.ticker}
            name={stock.name}
            price={stock.price}
            change={stock.change}
          />
        ))}
      </div>
    </div>
  );
}

export default function HeroBackgroundAnimation() {
  return (
    <div className="landing-hero-animation pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Floating quant readouts */}
      <div className="absolute inset-0">
        {quantMetrics.slice(0, quantPositions.length).map((metric, index) => {
          const pos = quantPositions[index];
          return (
            <div
              key={metric.label}
              className="landing-quant-label absolute hidden font-data-md sm:block"
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                animationDelay: pos.delay,
              }}
            >
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant/50">{metric.label}</span>
              <span className="mt-0.5 block text-sm text-on-surface/40">{metric.value}</span>
            </div>
          );
        })}
      </div>

      {/* SVG chart panels */}
      <div className="absolute inset-0">
        {chartPanels.map(({ stock, left, top, width, height, delay }) => {
          const path = buildSparklinePath(stock.id, stock.change, width, height);
          const up = stock.change >= 0;

          return (
            <div
              key={stock.id}
              className="landing-chart-panel absolute hidden md:block"
              style={{ left, top, animationDelay: delay }}
            >
              <div className="rounded-lg border border-outline-variant/20 bg-card/30 px-2.5 py-2 backdrop-blur-[2px]">
                <p className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant/45">
                  {stock.ticker}
                </p>
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="mt-1 h-10 w-[120px]"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`grad-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={up ? 'rgb(var(--color-bid) / 0.25)' : 'rgb(var(--color-ask) / 0.25)'} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${path} L ${width} ${height} L 0 ${height} Z`}
                    fill={`url(#grad-${stock.id})`}
                    className="landing-chart-fill"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={up ? 'rgb(var(--color-bid) / 0.45)' : 'rgb(var(--color-ask) / 0.45)'}
                    strokeWidth="1.5"
                    className="landing-chart-line"
                    pathLength={100}
                  />
                </svg>
              </div>
            </div>
          );
        })}

        {/* Candlestick strip — bottom-left */}
        <div className="landing-chart-panel absolute bottom-[22%] left-[4%] hidden lg:block" style={{ animationDelay: '1.5s' }}>
          <svg viewBox="0 0 120 40" className="h-10 w-[120px] opacity-30">
            {buildCandleBars('candles-main', 10, 36).map((bar, i) => {
              const x = 6 + i * 11;
              const color = bar.bullish ? 'rgb(var(--color-bid) / 0.5)' : 'rgb(var(--color-ask) / 0.5)';
              return (
                <g key={i}>
                  <line x1={x} y1={20 - bar.wick / 2} x2={x} y2={20 + bar.wick / 2} stroke={color} strokeWidth="1" />
                  <rect x={x - 3} y={20 - bar.body / 2} width={6} height={bar.body} fill={color} rx="0.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Area chart — top-right */}
        <div className="landing-chart-panel absolute right-[5%] top-[20%] hidden lg:block" style={{ animationDelay: '2.2s' }}>
          <svg viewBox="0 0 160 50" className="h-12 w-40 opacity-25">
            <path
              d={buildSparklinePath('area-chart', 3.2, 160, 50)}
              fill="none"
              stroke="rgb(var(--color-primary) / 0.4)"
              strokeWidth="1.5"
              className="landing-chart-line"
              pathLength={100}
            />
          </svg>
        </div>
      </div>

      {/* Running ticker bands — desktop only to keep mobile hero readable */}
      <div className="absolute inset-x-0 top-[45%] hidden space-y-3 opacity-60 md:block lg:top-[42%] lg:opacity-70">
        <TickerRow />
        <TickerRow reverse />
      </div>

      {/* Secondary quant ticker */}
      <div className="landing-quant-ticker absolute inset-x-0 bottom-[12%] hidden overflow-hidden opacity-40 md:block lg:bottom-[18%] lg:opacity-50">
        <div className="landing-ticker-track landing-quant-track flex w-max gap-8 px-4">
          {[...quantMetrics, ...quantMetrics].map((metric, index) => (
            <span key={`${metric.label}-${index}`} className="inline-flex shrink-0 items-center gap-2 font-data-md text-xs">
              <span className="text-on-surface-variant/40">{metric.label}</span>
              <span className="text-on-surface/35">{metric.value}</span>
              <span className="text-on-surface-variant/20">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Vignette — keeps foreground text readable */}
      <div className="landing-hero-animation-mask absolute inset-0" />
    </div>
  );
}
