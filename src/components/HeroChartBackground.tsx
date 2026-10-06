import { useLayoutEffect, useMemo, useRef } from 'react';
import { animate, createTimeline, stagger, svg } from 'animejs';

const W = 1440;
const H = 800;
const MAIN_END = W * 0.84;

type Point = [number, number];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function walk(
  seed: number,
  count: number,
  startY: number,
  drift: number,
  wobble: number,
  minY: number,
  maxY: number,
  xEnd = W,
): Point[] {
  const rnd = seeded(seed);
  const pts: Point[] = [];
  let y = startY;
  for (let i = 0; i < count; i += 1) {
    const x = (i / (count - 1)) * xEnd;
    y += (rnd() - 0.5) * wobble + drift;
    y = Math.max(minY, Math.min(maxY, y));
    pts.push([x, y]);
  }
  return pts;
}

function smoothPath(pts: Point[]) {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

type Candle = { x: number; open: number; close: number; high: number; low: number; up: boolean };

function buildCandles(seed: number, count: number): Candle[] {
  const rnd = seeded(seed);
  const candles: Candle[] = [];
  const slot = W / count;
  let price = 610;
  for (let i = 0; i < count; i += 1) {
    const open = price;
    const move = (rnd() - 0.42) * 50;
    const close = Math.max(520, Math.min(720, open + move));
    const high = Math.max(open, close) + rnd() * 18;
    const low = Math.min(open, close) - rnd() * 18;
    candles.push({ x: slot * i + slot / 2, open, close, high, low, up: close >= open });
    price = close;
  }
  return candles;
}

export default function HeroChartBackground() {
  const rootRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    const main = walk(7, 40, 540, -6.4, 70, 190, 600, MAIN_END);
    const gold = walk(23, 42, 440, -3.6, 58, 150, 540);
    const faint = walk(41, 42, 380, -1.8, 76, 110, 500);
    const mainPath = smoothPath(main);
    const areaPath = `${mainPath} L ${MAIN_END} ${H} L 0 ${H} Z`;
    const last = main[main.length - 1];
    return {
      mainPath,
      areaPath,
      goldPath: smoothPath(gold),
      faintPath: smoothPath(faint),
      last,
      candles: buildCandles(99, 36),
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const q = (selector: string) => Array.from(root.querySelectorAll<SVGElement>(selector));
    const lines = {
      main: root.querySelector<SVGPathElement>('.hc-main'),
      gold: root.querySelector<SVGPathElement>('.hc-gold'),
      faint: root.querySelector<SVGPathElement>('.hc-faint'),
    };
    if (!lines.main || !lines.gold || !lines.faint) return undefined;

    const intro = createTimeline({ defaults: { ease: 'inOutQuad' } });

    intro
      .add(q('.hc-grid'), { opacity: [0, 1], duration: 900, delay: stagger(50) }, 0)
      .add(q('.hc-candle'), {
        scaleY: [0, 1],
        opacity: [0, 1],
        duration: 650,
        delay: stagger(28),
        ease: 'outBack(1.4)',
      }, 300)
      .add(svg.createDrawable(lines.faint), { draw: ['0 0', '0 1'], duration: 2600, ease: 'inOutCubic' }, 200)
      .add(svg.createDrawable(lines.gold), { draw: ['0 0', '0 1'], duration: 2600, ease: 'inOutCubic' }, 450)
      .add(svg.createDrawable(lines.main), { draw: ['0 0', '0 1'], duration: 2600, ease: 'inOutCubic' }, 700)
      .add(q('.hc-area'), { opacity: [0, 1], duration: 1600 }, 1500)
      .add(q('.hc-dot'), { scale: [0, 1], opacity: [0, 1], duration: 520, ease: 'outBack(2)' }, 3150)
      .add(q('.hc-tag'), { opacity: [0, 1], y: [10, 0], duration: 600 }, 3250);

    const pulse = animate(q('.hc-ring'), {
      r: [7, 26],
      opacity: [0.6, 0],
      duration: 1900,
      loop: true,
      ease: 'outQuad',
      delay: 3300,
    });

    const breathe = animate(q('.hc-float'), {
      y: [0, -10],
      duration: 4200,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
    });

    const scan = animate(q('.hc-scan'), {
      x: [-120, W + 120],
      duration: 11000,
      loop: true,
      ease: 'linear',
      delay: 3400,
    });

    const shimmer = animate(q('.hc-candle'), {
      opacity: [{ to: 0.95 }, { to: 0.45 }],
      duration: 2400,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
      delay: stagger(90, { start: 3400 }),
    });

    return () => {
      intro.revert();
      pulse.revert();
      breathe.revert();
      scan.revert();
      shimmer.revert();
    };
  }, []);

  const candleW = 10;

  return (
    <svg
      ref={rootRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0F4A3D" />
          <stop offset="60%" stopColor="#3DC482" />
          <stop offset="100%" stopColor="#6EE0A4" />
        </linearGradient>
        <linearGradient id="hc-area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3DC482" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#6EE0A4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#6EE0A4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hc-gold-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C89C5B" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C89C5B" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="hc-scan-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3DC482" stopOpacity="0" />
          <stop offset="50%" stopColor="#3DC482" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#3DC482" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hc-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="12%" stopColor="#fff" stopOpacity="1" />
          <stop offset="78%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="hc-mask">
          <rect width={W} height={H} fill="url(#hc-fade)" />
        </mask>
        <filter id="hc-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g mask="url(#hc-mask)">
        {[0.18, 0.34, 0.5, 0.66, 0.82].map((pct) => (
          <line
            key={pct}
            className="hc-grid"
            x1="0"
            y1={H * pct}
            x2={W}
            y2={H * pct}
            stroke="rgb(15 23 42 / 0.07)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        ))}

        <g className="hc-float">
          {data.candles.map((candle) => {
            const top = Math.min(candle.open, candle.close);
            const bodyH = Math.max(3, Math.abs(candle.close - candle.open));
            const color = candle.up ? '#3DC482' : '#C89C5B';
            return (
              <g
                key={candle.x}
                className="hc-candle"
                style={{ transformOrigin: `${candle.x}px ${candle.low}px`, transformBox: 'view-box' }}
                opacity="0.45"
              >
                <line x1={candle.x} y1={candle.high} x2={candle.x} y2={candle.low} stroke={color} strokeWidth="1.5" />
                <rect x={candle.x - candleW / 2} y={top} width={candleW} height={bodyH} rx="2" fill={color} fillOpacity={candle.up ? 0.55 : 0.7} />
              </g>
            );
          })}
        </g>

        <g className="hc-float">
          <path className="hc-area" d={data.areaPath} fill="url(#hc-area-fill)" />
          <path className="hc-faint" d={data.faintPath} fill="none" stroke="rgb(15 74 61 / 0.14)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 10" />
          <path className="hc-gold" d={data.goldPath} fill="none" stroke="url(#hc-gold-line)" strokeWidth="2" strokeLinecap="round" />
          <path className="hc-main" d={data.mainPath} fill="none" stroke="url(#hc-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#hc-glow)" />

          <g className="hc-scan" opacity="0.9">
            <rect x="-60" y="0" width="120" height={H} fill="url(#hc-scan-fill)" />
            <line x1="0" y1="0" x2="0" y2={H} stroke="#3DC482" strokeOpacity="0.35" strokeWidth="1" />
          </g>

          <circle className="hc-ring" cx={data.last[0]} cy={data.last[1]} r="7" fill="none" stroke="#3DC482" strokeWidth="2" opacity="0" />
          <circle className="hc-dot" cx={data.last[0]} cy={data.last[1]} r="7" fill="#3DC482" stroke="#fff" strokeWidth="3" style={{ transformOrigin: `${data.last[0]}px ${data.last[1]}px`, transformBox: 'view-box' }} />

          <g className="hc-tag" transform={`translate(${data.last[0] + 22} ${data.last[1] - 20})`}>
            <rect width="136" height="40" rx="8" fill="#0F4A3D" />
            <text x="12" y="17" fill="#C89C5B" fontSize="10" fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing="1">
              LAST PRINT
            </text>
            <text x="12" y="32" fill="#fff" fontSize="14" fontWeight="600" fontFamily="JetBrains Mono, ui-monospace, monospace">
              ₹425.50 <tspan fill="#6EE0A4">+3.2%</tspan>
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
