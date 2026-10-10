import { useEffect, useMemo, useState } from 'react';
import { Field } from '../components/ui';

type Side = 'buyer' | 'seller';
type TransactionId =
  | 'unlisted-off-market'
  | 'listed-delivery'
  | 'listed-intraday'
  | 'equity-futures'
  | 'equity-options';

type ChargeDef = {
  id: string;
  name: string;
  citation: string;
  note: string;
  /** Fraction of consideration. Null means the charge does not apply. */
  rate: number | null;
  payer: Side | null;
};

type Transaction = {
  id: TransactionId;
  label: string;
  summary: string;
  quantityLabel: string;
  quantityHint: string;
  priceLabel: string;
  considerationNote: string;
  charges: ChargeDef[];
};

const STT = 'Finance (No. 2) Act 2004, Chapter VII';
const STAMP = 'Indian Stamp Act 1899, Sch. I Art. 56A; liability Indian Stamp Act 1899, s. 29';
const GST_RATE = 0.18;

const TRANSACTIONS: Transaction[] = [
  {
    id: 'unlisted-off-market',
    label: 'Unlisted shares — off-market transfer',
    summary:
      'A private transfer between two demat accounts, settled off the exchange. This is how unlisted shares normally change hands.',
    quantityLabel: 'Quantity',
    quantityHint: 'Number of shares changing hands.',
    priceLabel: 'Price per share',
    considerationNote: 'Quantity × price. Every statutory rate below is applied to this figure.',
    charges: [
      {
        id: 'stt-buy',
        name: 'STT on the purchase',
        citation: STT,
        note: 'STT applies only to transactions on a recognised stock exchange. This transfer is outside it.',
        rate: null,
        payer: null,
      },
      {
        id: 'stt-sell',
        name: 'STT on the sale',
        citation: STT,
        note: 'STT applies only to transactions on a recognised stock exchange. This transfer is outside it.',
        rate: null,
        payer: null,
      },
      {
        id: 'stamp',
        name: 'Stamp duty',
        citation: STAMP,
        note: 'Transfer of a security on delivery basis. On a depository transfer, the duty is on the transferor, and the depository collects it.',
        rate: 0.00015,
        payer: 'seller',
      },
    ],
  },
  {
    id: 'listed-delivery',
    label: 'Listed shares — delivery on exchange',
    summary: 'A purchase or sale of listed equity on NSE or BSE that settles by taking or giving delivery.',
    quantityLabel: 'Quantity',
    quantityHint: 'Number of shares in the order.',
    priceLabel: 'Price per share',
    considerationNote: 'Quantity × price. Every statutory rate below is applied to this figure.',
    charges: [
      {
        id: 'stt-buy',
        name: 'STT on the purchase',
        citation: STT,
        note: 'Purchase of an equity share on a recognised stock exchange, settled by delivery.',
        rate: 0.001,
        payer: 'buyer',
      },
      {
        id: 'stt-sell',
        name: 'STT on the sale',
        citation: STT,
        note: 'Sale of an equity share on a recognised stock exchange, settled by delivery.',
        rate: 0.001,
        payer: 'seller',
      },
      {
        id: 'stamp',
        name: 'Stamp duty',
        citation: STAMP,
        note: 'Transfer of a security on delivery basis. The stock exchange collects it from the buyer.',
        rate: 0.00015,
        payer: 'buyer',
      },
    ],
  },
  {
    id: 'listed-intraday',
    label: 'Listed shares — intraday',
    summary: 'A listed equity trade that is squared off the same day, so no shares are taken into delivery.',
    quantityLabel: 'Quantity',
    quantityHint: 'Number of shares bought and sold the same day.',
    priceLabel: 'Price per share',
    considerationNote: 'Quantity × price. Every statutory rate below is applied to this turnover.',
    charges: [
      {
        id: 'stt-buy',
        name: 'STT on the purchase',
        citation: STT,
        note: 'No STT on the purchase of an equity share that is squared off the same day.',
        rate: null,
        payer: null,
      },
      {
        id: 'stt-sell',
        name: 'STT on the sale',
        citation: STT,
        note: 'Sale of an equity share on a recognised stock exchange, settled otherwise than by delivery.',
        rate: 0.00025,
        payer: 'seller',
      },
      {
        id: 'stamp',
        name: 'Stamp duty',
        citation: STAMP,
        note: 'Transfer of a security on a non-delivery basis. The stock exchange collects it from the buyer.',
        rate: 0.00003,
        payer: 'buyer',
      },
    ],
  },
  {
    id: 'equity-futures',
    label: 'Equity futures',
    summary: 'A futures contract on an equity share or index. Rates below use the contract value, not a premium.',
    quantityLabel: 'Quantity',
    quantityHint: 'Number of units in the contract value (lot size × lots).',
    priceLabel: 'Futures price',
    considerationNote: 'Quantity × futures price. This is the contract value the rates below use.',
    charges: [
      {
        id: 'stt-buy',
        name: 'STT on the purchase',
        citation: STT,
        note: 'STT on equity futures is charged on the sale, not the purchase.',
        rate: null,
        payer: null,
      },
      {
        id: 'stt-sell',
        name: 'STT on the sale',
        citation: STT,
        note: 'Sale of a futures contract in securities. This is the rate in force from 1 April 2026.',
        rate: 0.0005,
        payer: 'seller',
      },
      {
        id: 'stamp',
        name: 'Stamp duty',
        citation: STAMP,
        note: 'Equity futures. The stock exchange collects stamp duty from the buyer.',
        rate: 0.00002,
        payer: 'buyer',
      },
    ],
  },
  {
    id: 'equity-options',
    label: 'Equity options — on premium',
    summary:
      'Buying or selling an equity or index option. Rates below apply to the premium, not the strike. Exercising an option is a separate charge and is not included.',
    quantityLabel: 'Quantity',
    quantityHint: 'Number of units the premium covers.',
    priceLabel: 'Premium per unit',
    considerationNote: 'Quantity × premium. Statutory rates below are applied to this premium.',
    charges: [
      {
        id: 'stt-buy',
        name: 'STT on the purchase',
        citation: STT,
        note: 'Buying an option is not charged STT. Exercising an in-the-money option is a separate charge, and it is not included here.',
        rate: null,
        payer: null,
      },
      {
        id: 'stt-sell',
        name: 'STT on the sale',
        citation: STT,
        note: 'Sale of an option in securities, charged on the premium. This is the rate in force from 1 April 2026.',
        rate: 0.0015,
        payer: 'seller',
      },
      {
        id: 'stamp',
        name: 'Stamp duty',
        citation: STAMP,
        note: 'Equity options, on the premium. The stock exchange collects stamp duty from the buyer.',
        rate: 0.00003,
        payer: 'buyer',
      },
    ],
  },
];

function parseNumber(value: string) {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRate(rate: number) {
  const percent = Math.round(rate * 100 * 1e6) / 1e6;
  return `${percent}%`;
}

function sideName(side: Side) {
  return side === 'buyer' ? 'buyer' : 'seller';
}

export default function StampDutyCalculator() {
  const [transactionId, setTransactionId] = useState<TransactionId>('unlisted-off-market');
  const [side, setSide] = useState<Side>('buyer');
  const [quantity, setQuantity] = useState('100');
  const [price, setPrice] = useState('456');
  const [brokerage, setBrokerage] = useState('0');

  useEffect(() => {
    document.title = 'STT & stamp duty calculator — PreIPOKart';
  }, []);

  const transaction = TRANSACTIONS.find((item) => item.id === transactionId) ?? TRANSACTIONS[0];
  const qty = parseNumber(quantity);
  const px = parseNumber(price);
  const brokerFee = parseNumber(brokerage);

  const quantityError =
    quantity.trim() !== '' && !(qty > 0) ? 'Enter a quantity greater than zero.' : undefined;
  const priceError = price.trim() !== '' && !(px > 0) ? 'Enter a price greater than zero.' : undefined;
  const brokerageError =
    brokerage.trim() !== '' && (!(brokerFee >= 0) || !Number.isFinite(brokerFee))
      ? 'Enter a brokerage of zero or more.'
      : undefined;

  const ready = qty > 0 && px > 0 && brokerFee >= 0 && Number.isFinite(brokerFee);

  const result = useMemo(() => {
    if (!ready) return null;
    const consideration = roundMoney(qty * px);
    const gst = roundMoney(brokerFee * GST_RATE);
    const statutory = transaction.charges.map((charge) => ({
      ...charge,
      amount: charge.rate == null ? null : roundMoney(consideration * charge.rate),
    }));
    const lines = [
      ...statutory,
      {
        id: 'brokerage',
        name: 'Brokerage',
        citation: 'The fee you pay a broker for this side of the trade',
        note: 'Leave the brokerage at 0 when no broker fee applies. It is added only on your side.',
        rate: null,
        payer: side,
        amount: roundMoney(brokerFee),
        rateLabel: 'As entered',
      },
      {
        id: 'gst',
        name: 'GST on brokerage',
        citation: 'Central Goods and Services Tax Act 2017',
        note: 'GST of 18% is added on top of the brokerage you entered.',
        rate: GST_RATE,
        payer: side,
        amount: gst,
        rateLabel: formatRate(GST_RATE),
      },
    ];

    const both = roundMoney(lines.reduce((sum, line) => sum + (line.amount ?? 0), 0));
    const yours = roundMoney(
      lines.reduce((sum, line) => sum + (line.payer === side ? line.amount ?? 0 : 0), 0),
    );

    return { consideration, lines, both, yours };
  }, [brokerFee, px, qty, ready, side, transaction.charges]);

  const lines = result ? result.lines : transaction.charges;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-2xl">
        <p className="font-label-caps text-label-caps uppercase text-primary">Tools</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">
          STT & stamp duty
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Securities transaction tax and stamp duty on an unlisted or listed share transfer, and which side each charge falls on.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form className="card space-y-5 p-5 sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <Field id="stamp-transaction" label="Transaction type" hint={transaction.summary}>
            <select
              id="stamp-transaction"
              className="field min-h-11 cursor-pointer"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value as TransactionId)}
            >
              {TRANSACTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-col gap-2">
            <p id="stamp-side-label" className="label mb-0">
              You are the
            </p>
            <div
              role="group"
              aria-labelledby="stamp-side-label"
              className="grid grid-cols-2 rounded-lg border border-outline-variant/50 p-1"
            >
              {(['buyer', 'seller'] as const).map((option) => {
                const selected = side === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSide(option)}
                    className={`min-h-11 cursor-pointer rounded-md text-sm font-medium capitalize ${
                      selected ? 'bg-[#0F4A3D] text-white' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <Field id="stamp-quantity" label={transaction.quantityLabel} hint={transaction.quantityHint} error={quantityError}>
            <input
              id="stamp-quantity"
              className="field min-h-11"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={Boolean(quantityError)}
              aria-describedby={quantityError ? 'stamp-quantity-error' : undefined}
            />
          </Field>

          <Field id="stamp-price" label={transaction.priceLabel} error={priceError}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="stamp-price"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                aria-invalid={Boolean(priceError)}
                aria-describedby={priceError ? 'stamp-price-error' : undefined}
              />
            </div>
          </Field>

          <Field
            id="stamp-brokerage"
            label="Brokerage"
            hint="Leave at 0 if no broker fee applies. GST of 18% is added on top."
            error={brokerageError}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-data-md text-on-surface-variant" aria-hidden="true">
                ₹
              </span>
              <input
                id="stamp-brokerage"
                className="field min-h-11 pl-9"
                inputMode="decimal"
                value={brokerage}
                onChange={(event) => setBrokerage(event.target.value)}
                aria-invalid={Boolean(brokerageError)}
                aria-describedby={brokerageError ? 'stamp-brokerage-error' : undefined}
              />
            </div>
          </Field>
        </form>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6" aria-live="polite">
            <h2 className="font-headline-sm text-lg">Your charges</h2>
            <p className="mt-1 text-sm text-on-surface-variant">As the {sideName(side)} of this transfer.</p>
            <p className="mt-4 font-data-lg text-2xl text-on-surface">{result ? formatInr(result.yours) : '—'}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-outline-variant/40 pt-4">
              <div>
                <dt className="text-sm text-on-surface-variant">Consideration</dt>
                <dd className="mt-1 font-data-md text-lg text-on-surface">
                  {result ? formatInr(result.consideration) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Both sides</dt>
                <dd className="mt-1 font-data-md text-lg text-on-surface">{result ? formatInr(result.both) : '—'}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{transaction.considerationNote}</p>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4 sm:px-6">
              <h2 className="font-headline-sm text-lg">Breakdown</h2>
              <p className="text-sm text-on-surface-variant">Rate</p>
            </div>
            <div>
              {lines.map((line) => {
                const amount = 'amount' in line ? line.amount : null;
                const rateLabel =
                  'rateLabel' in line && line.rateLabel
                    ? line.rateLabel
                    : line.rate == null
                      ? 'Not applicable'
                      : formatRate(line.rate);
                const payer = line.payer;
                const onYou = payer === side;
                return (
                  <article key={line.id} className="border-b border-outline-variant/30 px-5 py-4 last:border-b-0 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-on-surface">{line.name}</h3>
                        <p className="mt-1 text-xs leading-snug text-on-surface-variant">{line.citation}</p>
                      </div>
                      <p className={`shrink-0 text-right text-sm ${rateLabel === 'Not applicable' ? 'text-on-surface-variant' : 'font-medium text-on-surface'}`}>
                        {rateLabel}
                        {amount != null ? (
                          <span className="mt-1 block font-data-md text-on-surface">{formatInr(amount)}</span>
                        ) : null}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{line.note}</p>
                    {payer ? (
                      <p className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${onYou ? 'bg-[#0F4A3D]/10 text-[#0F4A3D]' : 'bg-surface-container text-on-surface-variant'}`}>
                        {onYou ? `Falls on you, as the ${sideName(side)}.` : `Falls on the ${sideName(payer)}.`}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
        STT rates follow the Finance (No. 2) Act 2004. Futures and options rates are those in force from 1 April 2026. Stamp duty follows the Indian Stamp Act 1899, Schedule I, Article 56A. Exchanges and depositories round these charges to the nearest rupee. Brokerage here is only the fee you entered. This is an estimate, not tax or legal advice.
      </p>
    </div>
  );
}
