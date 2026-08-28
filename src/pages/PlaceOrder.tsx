import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, ShieldCheck } from '@phosphor-icons/react';
import { CompanyLogo, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import type { OrderSide } from '../api/types';
import { useApi } from '../hooks/useApi';
import posthog, { isPostHogConfigured } from '../posthog';

export default function PlaceOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assetParam = searchParams.get('asset');
  const { data: listed } = useApi(() => api.listStocks(), [], !assetParam);
  const assetId = assetParam || listed?.data[0]?.id || '';
  const { data: activeAsset, error, loading } = useApi(() => api.getStock(assetId), [assetId], Boolean(assetId));
  const { data: book } = useApi(() => api.getOrderBook(assetId), [assetId], Boolean(assetId));
  const { data: chart } = useApi(() => api.getStockChart(assetId, '1M'), [assetId], Boolean(assetId));

  const sideParam = searchParams.get('side');
  const [orderType, setOrderType] = useState<OrderSide>(sideParam === 'SELL' ? 'SELL' : 'BUY');
  const [priceInput, setPriceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('1000');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeAsset) setPriceInput(activeAsset.price.toString());
  }, [activeAsset]);

  useEffect(() => {
    if (sideParam === 'SELL' || sideParam === 'BUY') setOrderType(sideParam);
  }, [sideParam]);

  useEffect(() => {
    if (txSuccess) successRef.current?.focus();
  }, [txSuccess]);

  const price = parseFloat(priceInput) || 0;
  const quantity = parseInt(quantityInput, 10) || 0;
  const estimatedTotal = price * quantity;
  const escrowFee = estimatedTotal * 0.0025;
  const netObligation = orderType === 'BUY' ? estimatedTotal + escrowFee : estimatedTotal - escrowFee;

  const chartPath = (() => {
    const points = chart?.points ?? [];
    if (!points.length) return 'M0,70 Q20,50 40,58 T80,30 T100,42';
    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return points
      .map((pt, i) => {
        const x = points.length === 1 ? 0 : (i / (points.length - 1)) * 100;
        const y = max === min ? 50 : ((max - pt.price) / (max - min)) * 70 + 15;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  })();

  const handleConfirmOrder = async () => {
    const next: string[] = [];
    if (price <= 0 || quantity <= 0) next.push('Enter a valid price and quantity.');
    if (!agreeTerms) next.push('Please tick the box to confirm you understand the deal.');
    if (next.length) {
      setErrors(next);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setErrors([]);
    setIsProcessing(true);
    try {
      const created = await api.placeOrder({
        assetId,
        side: orderType,
        price,
        quantity,
        acceptedTerms: true,
      });
      if (isPostHogConfigured) {
        posthog.capture('order_created', {
          asset_id: assetId,
          order_side: orderType,
          quantity,
        });
      }
      setCreatedId(created.id);
      setTxSuccess(true);
    } catch (err) {
      setErrors([errorMessage(err, 'Could not place this request.')]);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <QueryStatus loading={loading || !activeAsset} error={error}>
      {activeAsset ? (
        <div className="flex flex-col gap-6">
          <Link to="/orders" className="text-sm text-accent hover:underline">
            ← Back to orders
          </Link>
          <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <CompanyLogo name={activeAsset.name} domain={activeAsset.domain} />
                <div>
                  <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
                    {activeAsset.name}
                    <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {activeAsset.ticker}
                    </span>
                  </h1>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {activeAsset.series} • {activeAsset.lockup}
                  </p>
                  <Link to={`/stocks/${activeAsset.id}`} className="mt-1 inline-block text-xs text-accent hover:underline">
                    Company details
                  </Link>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="font-mono text-xl font-semibold text-accent">Last price ₹{activeAsset.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Company value {activeAsset.impliedVal}</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="flex flex-col gap-4 xl:col-span-8">
              <section className="card min-h-[220px] overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Price over time</h2>
                </div>
                <div className="relative h-48 bg-surface-container-low">
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
                    <path d={chartPath} fill="none" stroke="rgb(var(--color-primary-container))" strokeWidth="1.2" />
                  </svg>
                </div>
              </section>

              <section className="card overflow-hidden">
                <h2 className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Who wants to buy or sell
                </h2>
                <div className="grid grid-cols-2 divide-x divide-border text-sm">
                  <div>
                    <div className="grid grid-cols-3 bg-muted/50 px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">
                      <span>Shares</span>
                      <span className="text-center">Buyers pay</span>
                      <span className="text-right">People</span>
                    </div>
                    {(book?.bids ?? []).map((level) => (
                      <div key={`bid-${level.price}`} className="relative grid grid-cols-3 px-3 py-2 font-mono text-bid">
                        <span>{level.quantity.toLocaleString()}</span>
                        <span className="text-center">₹{level.price.toFixed(2)}</span>
                        <span className="text-right text-muted-foreground">{level.participants}</span>
                      </div>
                    ))}
                    {!book?.bids?.length ? (
                      <p className="px-3 py-4 text-xs text-muted-foreground">No bids yet.</p>
                    ) : null}
                  </div>
                  <div>
                    <div className="grid grid-cols-3 bg-muted/50 px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">
                      <span>Sellers want</span>
                      <span className="text-center">Shares</span>
                      <span className="text-right">People</span>
                    </div>
                    {(book?.asks ?? []).map((level) => (
                      <div key={`ask-${level.price}`} className="grid grid-cols-3 px-3 py-2 font-mono text-ask">
                        <span>₹{level.price.toFixed(2)}</span>
                        <span className="text-center">{level.quantity.toLocaleString()}</span>
                        <span className="text-right text-muted-foreground">{level.participants}</span>
                      </div>
                    ))}
                    {!book?.asks?.length ? (
                      <p className="px-3 py-4 text-xs text-muted-foreground">No asks yet.</p>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>

            <aside className="card flex flex-col xl:col-span-4">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="font-mono text-[11px] uppercase tracking-wider">Place your request</h2>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-accent">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Money held safely
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-4">
                {errors.length > 0 && (
                  <div ref={errorRef} role="alert" tabIndex={-1} className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    <p className="font-semibold">There is a problem</p>
                    <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                      {errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex rounded-lg bg-muted p-1" role="group" aria-label="Order side">
                  <button
                    type="button"
                    aria-pressed={orderType === 'BUY'}
                    onClick={() => setOrderType('BUY')}
                    className={`flex-1 cursor-pointer rounded-md py-2 font-mono text-xs uppercase transition duration-200 ${
                      orderType === 'BUY' ? 'bg-card text-bid' : 'text-muted-foreground'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    aria-pressed={orderType === 'SELL'}
                    onClick={() => setOrderType('SELL')}
                    className={`flex-1 cursor-pointer rounded-md py-2 font-mono text-xs uppercase transition duration-200 ${
                      orderType === 'SELL' ? 'bg-card text-ask' : 'text-muted-foreground'
                    }`}
                  >
                    Sell
                  </button>
                </div>
                <div>
                  <label className="label" htmlFor="px">
                    {orderType === 'BUY' ? 'Price you will pay (₹)' : 'Price you will accept (₹)'}
                  </label>
                  <input id="px" type="number" className="field text-right" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="qty">
                    Number of shares
                  </label>
                  <input id="qty" type="number" className="field text-right" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} />
                </div>
                <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">₹{estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee (0.25%)</span>
                    <span className="font-mono">₹{escrowFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>{orderType === 'BUY' ? 'You pay' : 'You receive'}</span>
                    <span className="font-mono text-accent">
                      ₹{netObligation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="mt-0.5" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                  I understand this is a private-company deal and PreIPOKart will hold the money until both sides complete it.
                </label>
              </div>
              <div className="border-t border-border p-4">
                <button type="button" className="btn-primary w-full" onClick={() => void handleConfirmOrder()}>
                  Confirm {orderType === 'BUY' ? 'buy' : 'sell'}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>

          {isProcessing && (
            <div className="fixed inset-0 z-modal flex items-center justify-center bg-scrim/70 p-4" role="alertdialog" aria-busy="true" aria-labelledby="escrow-title">
              <div className="card max-w-sm p-8 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                <h2 id="escrow-title" className="mt-4 text-lg font-semibold">
                  Sending your request…
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">Please wait. Do not close this window.</p>
              </div>
            </div>
          )}

          {txSuccess && (
            <div className="fixed inset-0 z-modal flex items-center justify-center bg-scrim/70 p-4" role="dialog" aria-modal="true" aria-labelledby="success-title">
              <div className="card max-w-sm p-8 text-center">
                <CheckCircle size={48} className="mx-auto text-accent" aria-hidden="true" />
                <h2 id="success-title" className="mt-4 text-lg font-semibold">
                  Request sent
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your {orderType === 'BUY' ? 'buy' : 'sell'} of {quantity.toLocaleString()} shares of {activeAsset.ticker} at ₹
                  {price.toFixed(2)} is now on the orders list, waiting for a match.
                </p>
                <button
                  ref={successRef}
                  type="button"
                  className="btn-primary mt-6 w-full"
                  onClick={() => {
                    setTxSuccess(false);
                    navigate(createdId ? `/orders/${createdId}` : '/orders');
                  }}
                >
                  View this order
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </QueryStatus>
  );
}
