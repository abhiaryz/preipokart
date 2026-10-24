import { useEffect, useMemo, useState } from 'react';
import { Field } from '../components/ui';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const sharesFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function parseNumber(value: string) {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

export default function ShareBudget() {
  const [amount, setAmount] = useState('500000');
  const [price, setPrice] = useState('456');

  useEffect(() => {
    document.title = 'Shares for a budget — PreIPOKart';
  }, []);

  const budget = parseNumber(amount);
  const px = parseNumber(price);
  const amountError = amount.trim() !== '' && !(budget > 0) ? 'Enter an amount greater than zero.' : undefined;
  const priceError = price.trim() !== '' && !(px > 0) ? 'Enter a price greater than zero.' : undefined;

  const result = useMemo(() => {
    if (!(budget > 0) || !(px > 0)) return null;
    const shares = Math.floor(budget / px);
    const consideration = shares * px;
    const leftover = budget - consideration;
    const shortfall = shares >= 0 && leftover > 0 ? px - leftover : 0;
    return { shares, consideration, leftover, shortfall };
  }, [budget, px]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-2xl">
        <p className="font-label-caps text-label-caps uppercase text-primary">Tools</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">
          Shares for a budget
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          See how many whole shares an amount buys at a given price, what that costs, and the cash left over.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form className="card space-y-5 p-5 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <Field id="budget-amount" label="Amount" hint="The cash you want to put into this name." error={amountError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="budget-amount"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={Boolean(amountError)}
                aria-describedby={amountError ? 'budget-amount-error' : undefined}
              />
            </div>
          </Field>

          <Field id="budget-price" label="Price per share" error={priceError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="budget-price"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                aria-invalid={Boolean(priceError)}
                aria-describedby={priceError ? 'budget-price-error' : undefined}
              />
            </div>
          </Field>
        </form>

        <section className="card p-5 sm:p-6" aria-live="polite">
          <h2 className="font-headline-sm text-lg">Whole shares</h2>
          {result ? (
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-on-surface-variant">Shares</dt>
                <dd className="mt-1 font-data-lg text-2xl text-on-surface">{sharesFormat.format(result.shares)}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-on-surface-variant">Consideration</dt>
                  <dd className="mt-1 font-data-md text-lg text-on-surface">{inr.format(result.consideration)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Cash left over</dt>
                  <dd className="mt-1 font-data-md text-lg text-on-surface">{inr.format(result.leftover)}</dd>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {inr.format(budget)} at {inr.format(px)} a share buys {sharesFormat.format(result.shares)} whole{' '}
                {result.shares === 1 ? 'share' : 'shares'} for {inr.format(result.consideration)}.
                {result.shortfall > 0
                  ? ` ${inr.format(result.shortfall)} more would buy one more share.`
                  : result.leftover === 0
                    ? ' The amount divides evenly.'
                    : ''}
              </p>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">Enter an amount and a price per share.</p>
          )}
        </section>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
        This counts whole shares only. It does not include stamp duty, brokerage, or GST. Those sit on the break-even and stamp duty calculators.
      </p>
    </div>
  );
}
