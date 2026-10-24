import { useEffect, useMemo, useState } from 'react';
import { Field } from '../components/ui';

/** Unlisted off-market delivery transfer. Seller pays. Indian Stamp Act 1899, Sch. I Art. 56A. */
const STAMP_RATE = 0.00015;
const GST_RATE = 0.18;

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseNumber(value: string) {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function BreakEven() {
  const [price, setPrice] = useState('456');
  const [quantity, setQuantity] = useState('100');
  const [buyBrokerage, setBuyBrokerage] = useState('0');
  const [sellBrokerage, setSellBrokerage] = useState('0');

  useEffect(() => {
    document.title = 'Break-even exit price — PreIPOKart';
  }, []);

  const px = parseNumber(price);
  const qty = parseNumber(quantity);
  const buyFee = parseNumber(buyBrokerage);
  const sellFee = parseNumber(sellBrokerage);

  const priceError = price.trim() !== '' && !(px > 0) ? 'Enter a buy price greater than zero.' : undefined;
  const quantityError = quantity.trim() !== '' && !(qty > 0) ? 'Enter a quantity greater than zero.' : undefined;
  const buyError =
    buyBrokerage.trim() !== '' && (!(buyFee >= 0) || !Number.isFinite(buyFee))
      ? 'Enter a brokerage of zero or more.'
      : undefined;
  const sellError =
    sellBrokerage.trim() !== '' && (!(sellFee >= 0) || !Number.isFinite(sellFee))
      ? 'Enter a brokerage of zero or more.'
      : undefined;

  const result = useMemo(() => {
    if (!(px > 0) || !(qty > 0) || !(buyFee >= 0) || !(sellFee >= 0)) return null;
    if (!Number.isFinite(buyFee) || !Number.isFinite(sellFee)) return null;
    const buyGst = roundMoney(buyFee * GST_RATE);
    const sellGst = roundMoney(sellFee * GST_RATE);
    const buyCost = roundMoney(qty * px + buyFee + buyGst);
    const allInPerShare = buyCost / qty;
    const netNeeded = buyCost + sellFee + sellGst;
    const exitPrice = netNeeded / (qty * (1 - STAMP_RATE));
    const saleConsideration = roundMoney(qty * exitPrice);
    const stamp = roundMoney(saleConsideration * STAMP_RATE);
    return { buyGst, sellGst, buyCost, allInPerShare, exitPrice, saleConsideration, stamp };
  }, [buyFee, px, qty, sellFee]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-2xl">
        <p className="font-label-caps text-label-caps uppercase text-primary">Tools</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">
          Break-even exit price
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          The sale price that covers what you paid, brokerage, GST on that brokerage, and stamp duty on an unlisted transfer.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form className="card space-y-5 p-5 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <Field id="be-price" label="Buy price per share" error={priceError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="be-price"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                aria-invalid={Boolean(priceError)}
                aria-describedby={priceError ? 'be-price-error' : undefined}
              />
            </div>
          </Field>

          <Field id="be-quantity" label="Quantity" hint="Number of shares in the round trip." error={quantityError}>
            <input
              id="be-quantity"
              className="field min-h-11"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={Boolean(quantityError)}
              aria-describedby={quantityError ? 'be-quantity-error' : undefined}
            />
          </Field>

          <Field
            id="be-buy-brokerage"
            label="Brokerage to buy"
            hint="Leave at 0 if no broker fee applies. GST of 18% is added on top."
            error={buyError}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="be-buy-brokerage"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={buyBrokerage}
                onChange={(event) => setBuyBrokerage(event.target.value)}
                aria-invalid={Boolean(buyError)}
                aria-describedby={buyError ? 'be-buy-brokerage-error' : undefined}
              />
            </div>
          </Field>

          <Field id="be-sell-brokerage" label="Brokerage to sell" hint="Charged again when you exit." error={sellError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="be-sell-brokerage"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={sellBrokerage}
                onChange={(event) => setSellBrokerage(event.target.value)}
                aria-invalid={Boolean(sellError)}
                aria-describedby={sellError ? 'be-sell-brokerage-error' : undefined}
              />
            </div>
          </Field>
        </form>

        <section className="card p-5 sm:p-6" aria-live="polite">
          <h2 className="font-headline-sm text-lg">Exit price</h2>
          {result ? (
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-on-surface-variant">Break-even sale price</dt>
                <dd className="mt-1 font-data-lg text-2xl text-on-surface">{inr.format(result.exitPrice)}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-on-surface-variant">All-in cost per share</dt>
                  <dd className="mt-1 font-data-md text-lg text-on-surface">{inr.format(result.allInPerShare)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Stamp duty on the sale</dt>
                  <dd className="mt-1 font-data-md text-lg text-on-surface">{inr.format(result.stamp)}</dd>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Buying {quantity} shares at {inr.format(px)} costs {inr.format(result.buyCost)} after buy brokerage and GST.
                Selling the same shares at {inr.format(result.exitPrice)} ({inr.format(result.saleConsideration)} in total) covers that
                cost, sell brokerage, GST, and 0.015% stamp duty.
              </p>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">Enter a buy price and a quantity.</p>
          )}
        </section>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
        Stamp duty here is 0.015% of the sale consideration, paid by the seller on an unlisted off-market delivery transfer under the Indian Stamp Act 1899, Schedule I, Article 56A. The buyer of these shares does not pay that duty. GST is 18% on the brokerage you enter. Exchanges and depositories round charges to the nearest rupee. This is an estimate, not tax or legal advice.
      </p>
    </div>
  );
}
