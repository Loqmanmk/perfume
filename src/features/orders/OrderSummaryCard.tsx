import type { ReactNode } from 'react';
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/domain/order';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'border-gold/40 text-gold',
  shipped: 'border-sky-300/40 text-sky-200',
  delivered: 'border-emerald-300/40 text-emerald-200',
  cancelled: 'border-cream/20 text-muted',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em]',
        STATUS_STYLES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function formatOrderDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

interface OrderSummaryCardProps {
  order: Order;
  /** Extra content in the header, e.g. the customer or a status control. */
  aside?: ReactNode;
}

export function OrderSummaryCard({ order, aside }: OrderSummaryCardProps) {
  return (
    <article className="hairline rounded-2xl border bg-ink-900 p-5 md:p-6" aria-label={`Order ${order.number}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl">{order.number}</p>
          <p className="text-xs text-muted">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {aside}
          <OrderStatusBadge status={order.status} />
        </div>
      </header>

      <ul className="hairline mt-4 divide-y divide-cream/10 border-t text-sm">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.sizeMl}`} className="flex justify-between gap-4 py-2.5">
            <span>
              {item.productName} <span className="text-muted">· {item.sizeMl} ml × {item.quantity}</span>
            </span>
            <span className="tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <footer className="hairline flex items-baseline justify-between border-t pt-3">
        <span className="text-sm text-muted">
          {order.shippingFee === 0 ? 'Free shipping' : `Shipping ${formatPrice(order.shippingFee)}`}
        </span>
        <span className="text-lg font-semibold tabular-nums">{formatPrice(order.total)}</span>
      </footer>
    </article>
  );
}
