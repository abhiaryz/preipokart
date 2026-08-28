import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { CompanyLogo, Field, InlineNotice } from '../components/ui';
import {
  STATUS_LABEL,
  STATUS_STEPS,
  canCancel,
  canEdit,
  cancelOrder,
  getOrder,
  subscribeOrders,
  updateOpenOrder,
} from '../data/orders';
import posthog, { isPostHogConfigured } from '../posthog';

function useOrder(id: string | undefined) {
  return useSyncExternalStore(
    subscribeOrders,
    () => (id ? getOrder(id) : undefined),
    () => (id ? getOrder(id) : undefined)
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = useOrder(id);
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setPrice(String(order.price));
      setQty(String(order.quantity));
    }
  }, [order]);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <p className="mt-2 text-on-surface-variant">It may have been removed, or the link is wrong.</p>
        <Link to="/orders" className="btn-primary mt-6 inline-flex">
          Back to orders
        </Link>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status === 'cancelled' ? 'open' : order.status);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    const nextPrice = Number(price);
    const nextQty = Number(qty);
    if (nextPrice <= 0 || nextQty <= 0) {
      setError('Enter a valid price and number of shares.');
      setNotice('');
      return;
    }
    const ok = updateOpenOrder(order.id, nextPrice, nextQty);
    if (ok && isPostHogConfigured) {
      posthog.capture('order_updated', {
        asset_id: order.assetId,
        order_side: order.side,
        quantity: nextQty,
      });
    }
    setError(ok ? '' : 'This order can no longer be changed.');
    setNotice(ok ? 'Order updated. It stays in the book at the new price.' : '');
  };

  const onCancel = () => {
    const ok = cancelOrder(order.id);
    if (ok && isPostHogConfigured) {
      posthog.capture('order_cancelled', { asset_id: order.assetId, order_side: order.side });
    }
    setError(ok ? '' : 'This order can no longer be cancelled.');
    setNotice(ok ? 'Order cancelled. It will not match with anyone.' : '');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" className="btn-ghost mb-4" onClick={() => navigate('/orders')}>
        <ArrowLeft size={16} aria-hidden="true" />
        All orders
      </button>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <CompanyLogo name={order.company} domain={order.domain} />
          <div>
            <p className="font-mono text-xs text-on-surface-variant">{order.id}</p>
            <h1 className="text-2xl font-semibold">
              {order.side === 'BUY' ? 'Buy' : 'Sell'} {order.company}
            </h1>
            <p className="text-sm text-on-surface-variant">{STATUS_LABEL[order.status]}</p>
          </div>
        </div>
        <Link to={`/stocks/${order.assetId}`} className="text-sm text-accent hover:underline">
          Company details
        </Link>
      </header>

      {notice ? <div className="mb-4"><InlineNotice tone="success">{notice}</InlineNotice></div> : null}
      {error ? <div className="mb-4"><InlineNotice tone="error">{error}</InlineNotice></div> : null}

      <ol className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUS_STEPS.map((step, idx) => {
          const done = order.status === 'cancelled' ? false : idx <= stepIndex;
          const current = order.status !== 'cancelled' && idx === stepIndex;
          return (
            <li
              key={step}
              className={`rounded-lg border px-3 py-2 text-xs ${
                current ? 'border-primary-container bg-primary-container/10' : 'border-border'
              } ${done ? 'text-on-surface' : 'text-on-surface-variant'}`}
            >
              <span className="flex items-center gap-1 font-medium">
                {done ? <CheckCircle size={14} aria-hidden="true" /> : <span className="font-mono">{idx + 1}</span>}
                {STATUS_LABEL[step]}
              </span>
            </li>
          );
        })}
      </ol>
      {order.status === 'cancelled' ? (
        <p className="mb-6 text-sm text-on-surface-variant">This request was cancelled and will not complete.</p>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-on-surface-variant">Shares</p>
          <p className="mt-1 font-mono text-xl">{order.quantity.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-on-surface-variant">Price</p>
          <p className="mt-1 font-mono text-xl">₹{order.price.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-on-surface-variant">{order.side === 'BUY' ? 'You pay' : 'You receive'}</p>
          <p className="mt-1 font-mono text-xl">₹{order.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {canEdit(order.status) ? (
        <form className="card mb-4 space-y-4 p-5" onSubmit={onSave}>
          <h2 className="text-lg font-semibold">Change this request</h2>
          <p className="text-sm text-on-surface-variant">You can change price or quantity while it is still waiting for a match.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="edit-price" label="Price (₹)">
              <input id="edit-price" className="field" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field id="edit-qty" label="Number of shares">
              <input id="edit-qty" className="field" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            </Field>
          </div>
          <button className="btn-primary" type="submit">
            Save changes
          </button>
        </form>
      ) : null}

      {canCancel(order.status) ? (
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Cancel</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {order.status === 'matched'
              ? 'A match was found. Cancelling now stops the deal before money is held.'
              : 'The request will leave the book and will not match.'}
          </p>
          <button type="button" className="btn-secondary mt-4" onClick={onCancel}>
            Cancel this order
          </button>
        </div>
      ) : order.status === 'holding' ? (
        <p className="text-sm text-on-surface-variant">
          Money or shares are already held. Open Help if you need to pause this deal.
        </p>
      ) : null}
    </div>
  );
}
