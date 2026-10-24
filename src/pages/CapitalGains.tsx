import { useEffect, useMemo, useState } from 'react';
import { Field } from '../components/ui';

/** New tax regime slabs for FY 2026-27. Budget 2026 left these unchanged. */
const SLABS: Array<{ upTo: number; rate: number }> = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.1 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.2 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
];

const LTCG_RATE = 0.125;
const CESS_RATE = 0.04;
const REBATE_LIMIT = 1_200_000;
const LONG_TERM_MONTHS = 24;

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function parseNumber(value: string) {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function taxOnIncome(income: number) {
  if (!(income > 0)) return 0;
  let tax = 0;
  let prev = 0;
  for (const slab of SLABS) {
    const top = Math.min(income, slab.upTo);
    if (top > prev) tax += (top - prev) * slab.rate;
    if (income <= slab.upTo) break;
    prev = slab.upTo;
  }
  return tax;
}

export default function CapitalGains() {
  const [buyPrice, setBuyPrice] = useState('400');
  const [sellPrice, setSellPrice] = useState('456');
  const [quantity, setQuantity] = useState('100');
  const [months, setMonths] = useState('36');
  const [otherIncome, setOtherIncome] = useState('0');

  useEffect(() => {
    document.title = 'Unlisted capital gains — PreIPOKart';
  }, []);

  const buy = parseNumber(buyPrice);
  const sell = parseNumber(sellPrice);
  const qty = parseNumber(quantity);
  const held = parseNumber(months);
  const other = parseNumber(otherIncome);

  const buyError = buyPrice.trim() !== '' && !(buy > 0) ? 'Enter a buy price greater than zero.' : undefined;
  const sellError = sellPrice.trim() !== '' && !(sell >= 0) ? 'Enter a sell price of zero or more.' : undefined;
  const quantityError = quantity.trim() !== '' && !(qty > 0) ? 'Enter a quantity greater than zero.' : undefined;
  const monthsError =
    months.trim() !== '' && (!(held > 0) || held > 1200) ? 'Enter a holding period up to 100 years.' : undefined;
  const incomeError =
    otherIncome.trim() !== '' && (!(other >= 0) || !Number.isFinite(other))
      ? 'Enter other income of zero or more.'
      : undefined;

  const result = useMemo(() => {
    if (!(buy > 0) || !(sell >= 0) || !(qty > 0) || !(held > 0) || held > 1200) return null;
    if (!(other >= 0) || !Number.isFinite(other)) return null;
    const gain = roundMoney((sell - buy) * qty);
    const longTerm = held > LONG_TERM_MONTHS;
    const proceeds = roundMoney(sell * qty);
    if (gain <= 0) {
      return { gain, longTerm, proceeds, tax: 0, cess: 0, totalTax: 0, left: gain, rebate: false };
    }
    if (longTerm) {
      const tax = roundMoney(gain * LTCG_RATE);
      const cess = roundMoney(tax * CESS_RATE);
      const totalTax = roundMoney(tax + cess);
      return { gain, longTerm, proceeds, tax, cess, totalTax, left: roundMoney(gain - totalTax), rebate: false };
    }
    const totalIncome = other + gain;
    const rebate = totalIncome <= REBATE_LIMIT;
    const tax = rebate ? 0 : roundMoney(taxOnIncome(totalIncome) - taxOnIncome(other));
    const cess = roundMoney(tax * CESS_RATE);
    const totalTax = roundMoney(tax + cess);
    return { gain, longTerm, proceeds, tax, cess, totalTax, left: roundMoney(gain - totalTax), rebate };
  }, [buy, held, other, qty, sell]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-2xl">
        <p className="font-label-caps text-label-caps uppercase text-primary">Tools</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">
          Unlisted capital gains
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Tax on a gain from unlisted shares, and what is left after that tax. A holding of 24 months or less is short-term. Longer than that is long-term.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form className="card space-y-5 p-5 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <Field id="cg-buy" label="Buy price per share" error={buyError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="cg-buy"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={buyPrice}
                onChange={(event) => setBuyPrice(event.target.value)}
                aria-invalid={Boolean(buyError)}
                aria-describedby={buyError ? 'cg-buy-error' : undefined}
              />
            </div>
          </Field>

          <Field id="cg-sell" label="Sell price per share" error={sellError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="cg-sell"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={sellPrice}
                onChange={(event) => setSellPrice(event.target.value)}
                aria-invalid={Boolean(sellError)}
                aria-describedby={sellError ? 'cg-sell-error' : undefined}
              />
            </div>
          </Field>

          <Field id="cg-quantity" label="Quantity" error={quantityError}>
            <input
              id="cg-quantity"
              className="field min-h-11"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={Boolean(quantityError)}
              aria-describedby={quantityError ? 'cg-quantity-error' : undefined}
            />
          </Field>

          <Field
            id="cg-months"
            label="Holding period"
            hint="Months. More than 24 is long-term."
            error={monthsError}
          >
            <div className="relative">
              <input
                id="cg-months"
                className="field min-h-11 pr-24"
                inputMode="decimal"
                value={months}
                onChange={(event) => setMonths(event.target.value)}
                aria-invalid={Boolean(monthsError)}
                aria-describedby={monthsError ? 'cg-months-error' : undefined}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                months
              </span>
            </div>
          </Field>

          <Field
            id="cg-income"
            label="Other taxable income"
            hint="Used only when the gain is short-term, so the slab can be applied. Leave at 0 if this sale is the only income."
            error={incomeError}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="cg-income"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={otherIncome}
                onChange={(event) => setOtherIncome(event.target.value)}
                aria-invalid={Boolean(incomeError)}
                aria-describedby={incomeError ? 'cg-income-error' : undefined}
              />
            </div>
          </Field>
        </form>

        <section className="card p-5 sm:p-6" aria-live="polite">
          <h2 className="font-headline-sm text-lg">After tax</h2>
          {result ? (
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-on-surface-variant">{result.gain >= 0 ? 'Left after tax' : 'Loss'}</dt>
                <dd className={`mt-1 font-data-lg text-2xl ${result.gain >= 0 ? 'text-on-surface' : 'text-ask'}`}>
                  {inr.format(result.gain >= 0 ? result.left : result.gain)}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-on-surface-variant">Gain</dt>
                  <dd className={`mt-1 font-data-md text-lg ${result.gain >= 0 ? 'text-bid' : 'text-ask'}`}>
                    {result.gain >= 0 ? '+' : ''}
                    {inr.format(result.gain)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Tax, including cess</dt>
                  <dd className="mt-1 font-data-md text-lg text-on-surface">{inr.format(result.totalTax)}</dd>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {result.longTerm ? 'Long-term' : 'Short-term'}, held {months} months.
                {result.gain > 0
                  ? result.longTerm
                    ? ` Tax is ${inr.format(result.tax)} at 12.5%, plus ${inr.format(result.cess)} cess.`
                    : result.rebate
                      ? ' Slab tax is zero because total income is within the ₹12 lakh rebate.'
                      : ` Slab tax on this gain is ${inr.format(result.tax)}, plus ${inr.format(result.cess)} cess.`
                  : ' A loss is not taxed here.'}
              </p>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">Enter the buy price, sell price, quantity, and holding period.</p>
          )}
        </section>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
        Rates follow the position for FY 2026-27 after Budget 2026. Unlisted shares held 24 months or less are taxed with your other income under the new-regime slabs. Held longer, the gain is long-term at 12.5% without indexation under section 112, plus 4% health and education cess. The ₹1.25 lakh exemption is for listed equity, so it is not applied here. Surcharge, the basic-exemption set-off, and loss set-off against other gains are not included. Brokerage and stamp duty are not deducted from the gain. This is an estimate, not tax or legal advice.
      </p>
    </div>
  );
}
