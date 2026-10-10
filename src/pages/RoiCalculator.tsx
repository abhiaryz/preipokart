import { useEffect, useMemo, useState } from 'react';
import { Field } from '../components/ui';

type PeriodUnit = 'years' | 'months';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function parseNumber(value: string) {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function formatPercent(value: number) {
  return `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;
}

function compactInr(value: number) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  if (abs >= 1_00_000) {
    const lakhs = abs / 1_00_000;
    return `${sign}₹${lakhs.toLocaleString('en-IN', { maximumFractionDigits: lakhs >= 10 ? 1 : 2 })} L`;
  }
  return inr.format(value);
}

type GrowthPoint = { label: string; value: number };

function growthPoints(principal: number, rate: number, years: number, unit: PeriodUnit, span: number): GrowthPoint[] {
  const valueAt = (t: number) => principal * (1 + rate / 100) ** t;
  if (unit === 'years' && Number.isInteger(span) && span <= 20) {
    return Array.from({ length: span + 1 }, (_, year) => ({
      label: year === 0 ? 'Now' : `Year ${year}`,
      value: valueAt(year),
    }));
  }
  if (unit === 'months' && Number.isInteger(span) && span <= 24) {
    return Array.from({ length: span + 1 }, (_, month) => ({
      label: month === 0 ? 'Now' : `${month} mo`,
      value: valueAt(month / 12),
    }));
  }
  const steps = 24;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = (years * index) / steps;
    const label = unit === 'months' ? `${Math.round(t * 12)} mo` : `Year ${t.toFixed(t >= 10 ? 0 : 1)}`;
    return { label, value: valueAt(t) };
  });
}

function GrowthChart({
  points,
  principal,
  positive,
}: {
  points: GrowthPoint[];
  principal: number;
  positive: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const activeHover = hover !== null && points[hover] ? hover : null;
  const width = 640;
  const height = 280;
  const pad = { left: 72, right: 16, top: 16, bottom: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const values = points.map((point) => point.value);
  const min = Math.min(principal, ...values);
  const max = Math.max(principal, ...values);
  const padY = (max - min) * 0.14 || Math.abs(principal) * 0.08 || 1;
  const yMin = min - padY;
  const yMax = max + padY;
  const xAt = (index: number) =>
    pad.left + (points.length === 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const yAt = (value: number) => pad.top + ((yMax - value) / (yMax - yMin)) * plotH;
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xAt(index).toFixed(2)},${yAt(point.value).toFixed(2)}`).join(' ');
  const area = `${line} L${xAt(points.length - 1).toFixed(2)},${(pad.top + plotH).toFixed(2)} L${xAt(0).toFixed(2)},${(pad.top + plotH).toFixed(2)} Z`;
  const stroke = positive ? 'rgb(var(--color-bid))' : 'rgb(var(--color-ask))';
  const endValue = values[values.length - 1] ?? principal;
  const yTicks = [endValue, (endValue + principal) / 2, principal].filter(
    (tick, index, all) => all.findIndex((other) => Math.abs(other - tick) < 1) === index,
  );
  const labelEvery = points.length <= 8 ? 1 : Math.ceil(points.length / 6);

  function hoverAt(clientX: number, bounds: DOMRect) {
    const viewAspect = width / height;
    const boxAspect = bounds.width / bounds.height;
    const drawW = boxAspect > viewAspect ? bounds.height * viewAspect : bounds.width;
    const offsetX = (bounds.width - drawW) / 2;
    const ratio = Math.min(1, Math.max(0, (clientX - bounds.left - offsetX) / drawW));
    const plotRatio = (ratio * width - pad.left) / plotW;
    const index = Math.min(points.length - 1, Math.max(0, Math.round(plotRatio * (points.length - 1))));
    setHover(index);
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: stroke }} aria-hidden="true" />
          Value
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-px w-4 border-t border-dashed border-on-surface-variant" aria-hidden="true" />
          Amount invested
        </span>
      </div>
      <div
        className="relative h-64 w-full sm:h-72"
        onPointerMove={(event) => hoverAt(event.clientX, event.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label={`Growth from ${inr.format(points[0]?.value ?? principal)} to ${inr.format(points[points.length - 1]?.value ?? principal)}`}
        >
          <defs>
            <linearGradient id="roi-growth-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={yAt(tick)}
                y2={yAt(tick)}
                stroke="rgb(var(--color-outline-variant))"
                strokeOpacity="0.55"
              />
              <text x={pad.left - 8} y={yAt(tick) + 4} textAnchor="end" fill="rgb(var(--color-on-surface-variant))" fontSize="12">
                {compactInr(tick)}
              </text>
            </g>
          ))}
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={yAt(principal)}
            y2={yAt(principal)}
            stroke="rgb(var(--color-on-surface-variant))"
            strokeDasharray="4 4"
            strokeOpacity="0.7"
          />
          <path d={area} fill="url(#roi-growth-fill)" />
          <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((point, index) =>
            index % labelEvery === 0 || index === points.length - 1 ? (
              <text
                key={point.label}
                x={xAt(index)}
                y={height - 10}
                textAnchor="middle"
                fill="rgb(var(--color-on-surface-variant))"
                fontSize="12"
              >
                {point.label}
              </text>
            ) : null,
          )}
          {activeHover !== null ? (
            <g>
              <line
                x1={xAt(activeHover)}
                x2={xAt(activeHover)}
                y1={pad.top}
                y2={pad.top + plotH}
                stroke="rgb(var(--color-on-surface))"
                strokeOpacity="0.25"
              />
              <circle cx={xAt(activeHover)} cy={yAt(points[activeHover].value)} r="5" fill={stroke} />
              <g transform={`translate(${xAt(activeHover) > width - 160 ? xAt(activeHover) - 132 : xAt(activeHover) + 10}, ${pad.top + 4})`}>
                <rect width="122" height="40" rx="8" fill="rgb(var(--color-card))" stroke="rgb(var(--color-outline-variant))" />
                <text x="10" y="16" fill="rgb(var(--color-on-surface-variant))" fontSize="11">
                  {points[activeHover].label}
                </text>
                <text x="10" y="32" fill="rgb(var(--color-on-surface))" fontSize="13" fontWeight="600">
                  {inr.format(points[activeHover].value)}
                </text>
              </g>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const [amount, setAmount] = useState('100000');
  const [annualReturn, setAnnualReturn] = useState('12');
  const [period, setPeriod] = useState('5');
  const [unit, setUnit] = useState<PeriodUnit>('years');

  useEffect(() => {
    document.title = 'ROI calculator — PreIPOKart';
  }, []);

  const principal = parseNumber(amount);
  const rate = parseNumber(annualReturn);
  const span = parseNumber(period);

  const amountError = amount.trim() !== '' && !(principal > 0) ? 'Enter an amount greater than zero.' : undefined;
  const returnError = annualReturn.trim() !== '' && !Number.isFinite(rate) ? 'Enter a return percentage.' : undefined;
  const periodError =
    period.trim() !== '' && (!(span > 0) || (unit === 'years' ? span : span / 12) > 100)
      ? 'Enter a time period between a moment and 100 years.'
      : undefined;

  const result = useMemo(() => {
    if (!(principal > 0) || !Number.isFinite(rate) || !(span > 0)) return null;
    const years = unit === 'months' ? span / 12 : span;
    if (years > 100) return null;
    const futureValue = principal * (1 + rate / 100) ** years;
    if (!Number.isFinite(futureValue)) return null;
    const gain = futureValue - principal;
    return {
      years,
      futureValue,
      gain,
      roiPercent: (gain / principal) * 100,
    };
  }, [principal, rate, span, unit]);

  const points = useMemo(() => {
    if (!result) return [];
    return growthPoints(principal, rate, result.years, unit, span);
  }, [principal, rate, result, span, unit]);

  const yearly = useMemo(() => {
    if (!result || unit !== 'years' || !Number.isInteger(span) || span > 12) return [];
    return points.slice(1).map((point, index) => ({
      year: index + 1,
      value: point.value,
      gain: point.value - principal,
    }));
  }, [points, principal, result, span, unit]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-2xl">
        <p className="font-label-caps text-label-caps uppercase text-primary">Tools</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">
          ROI calculator
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Estimate what an investment could be worth from the amount you put in, an annual return, and how long you hold it.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form className="card space-y-5 p-5 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <Field id="roi-amount" label="Amount invested" hint="The money you put in today." error={amountError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="roi-amount"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={Boolean(amountError)}
                aria-describedby={amountError ? 'roi-amount-error' : undefined}
              />
            </div>
          </Field>

          <Field id="roi-return" label="Expected annual return" hint="Compounded once a year." error={returnError}>
            <div className="relative">
              <input
                id="roi-return"
                className="field min-h-11 pr-10"
                inputMode="decimal"
                value={annualReturn}
                onChange={(event) => setAnnualReturn(event.target.value)}
                aria-invalid={Boolean(returnError)}
                aria-describedby={returnError ? 'roi-return-error' : undefined}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                %
              </span>
            </div>
          </Field>

          <Field id="roi-period" label="Time period" error={periodError}>
            <div className="flex gap-2">
              <input
                id="roi-period"
                className="field min-h-11"
                inputMode="decimal"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-invalid={Boolean(periodError)}
                aria-describedby={periodError ? 'roi-period-error' : undefined}
              />
              <div className="flex shrink-0 rounded-lg border border-outline-variant/50 p-1" role="group" aria-label="Time period unit">
                {(['years', 'months'] as const).map((option) => {
                  const selected = unit === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setUnit(option)}
                      className={`min-h-9 cursor-pointer rounded-md px-3 text-sm font-medium capitalize ${
                        selected ? 'bg-[#0F4A3D] text-white' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </Field>
        </form>

        <section className="card p-5 sm:p-6" aria-live="polite">
          <h2 className="font-headline-sm text-lg">Estimated outcome</h2>
          {result ? (
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-on-surface-variant">Future value</dt>
                <dd className="mt-1 font-data-lg text-2xl text-on-surface">{inr.format(result.futureValue)}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-on-surface-variant">Total return</dt>
                  <dd className={`mt-1 font-data-md text-lg ${result.gain >= 0 ? 'text-bid' : 'text-ask'}`}>
                    {result.gain >= 0 ? '+' : ''}
                    {inr.format(result.gain)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">ROI</dt>
                  <dd className={`mt-1 font-data-md text-lg ${result.roiPercent >= 0 ? 'text-bid' : 'text-ask'}`}>
                    {result.roiPercent >= 0 ? '+' : ''}
                    {formatPercent(result.roiPercent)}
                  </dd>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {inr.format(principal)} at {formatPercent(rate)} a year for{' '}
                {unit === 'months' ? `${span} months` : `${span} years`} grows to {inr.format(result.futureValue)}.
              </p>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">
              Enter an amount, a return, and a time period to see the estimate.
            </p>
          )}
        </section>
      </div>

      {points.length > 1 ? (
        <section className="card mt-6 p-5 sm:p-6">
          <h2 className="font-headline-sm text-lg">Growth</h2>
          <p className="mt-1 text-sm text-on-surface-variant">How the amount compounds across the time period.</p>
          <GrowthChart points={points} principal={principal} positive={result ? result.gain >= 0 : true} />
        </section>
      ) : null}

      {yearly.length > 0 ? (
        <section className="card mt-6 overflow-hidden">
          <h2 className="px-5 pt-5 font-headline-sm text-lg sm:px-6">Year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant">
                  <th className="px-5 py-3 font-medium sm:px-6" scope="col">Year</th>
                  <th className="px-5 py-3 font-medium sm:px-6" scope="col">Value</th>
                  <th className="px-5 py-3 font-medium sm:px-6" scope="col">Return</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((row) => (
                  <tr key={row.year} className="border-b border-outline-variant/30 last:border-0">
                    <th className="px-5 py-3 font-medium text-on-surface sm:px-6" scope="row">{row.year}</th>
                    <td className="px-5 py-3 font-data-md text-on-surface sm:px-6">{inr.format(row.value)}</td>
                    <td className={`px-5 py-3 font-data-md sm:px-6 ${row.gain >= 0 ? 'text-bid' : 'text-ask'}`}>
                      {row.gain >= 0 ? '+' : ''}
                      {inr.format(row.gain)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
        This is a compound-growth estimate, not a forecast. Unlisted shares can lose value, stay illiquid, and may not earn the return you enter.
      </p>
    </div>
  );
}
