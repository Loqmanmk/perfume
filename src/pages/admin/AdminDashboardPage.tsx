import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircleCheck, ExternalLink, Package, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ProductThumbnail } from '@/components/product/ProductThumbnail';
import { ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { LoadError, Skeleton } from '@/components/ui/Skeleton';
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type Order, type OrderStatus } from '@/domain/order';
import { FAMILY_LABELS, startingPrice, type Product } from '@/domain/product';
import { useDeleteProduct, useSetOrderStatus } from '@/features/admin/useAdminMutations';
import { useCatalogue } from '@/features/catalogue/useCatalogue';
import { OrderSummaryCard } from '@/features/orders/OrderSummaryCard';
import { errorMessage } from '@/lib/api/http';
import { queryKeys } from '@/lib/api/queryClient';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { orderApi } from '@/services/orderApi';

/** Message shown after saving a product, passed through router state. */
export interface DashboardNotice {
  text: string;
  slug: string;
}

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
] as const;
type Tab = (typeof TABS)[number]['id'];

function Notice({ notice, onDismiss }: { notice: DashboardNotice; onDismiss: () => void }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm">
      <CircleCheck size={18} className="text-gold" aria-hidden />
      <p className="flex-1">{notice.text}</p>
      <Link to={`/product/${notice.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-gold hover:underline">
        View in shop <ExternalLink size={14} aria-hidden />
      </Link>
      <button type="button" onClick={onDismiss} className="grid size-9 place-items-center rounded-full hover:text-gold" aria-label="Dismiss">
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="hairline rounded-2xl border bg-ink-900 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
    </div>
  );
}

function ProductRow({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <li className="hairline flex items-center gap-4 border-b py-4">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-800 p-1">
        <ProductThumbnail product={product} className="rounded-lg" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-2xl">{product.name}</p>
        <p className="truncate text-xs text-muted">
          {FAMILY_LABELS[product.family]} · {product.sizes.map((size) => `${size.ml} ml`).join(' / ')} · from{' '}
          {formatPrice(startingPrice(product))}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[0.6rem] font-semibold uppercase tracking-wider">
          {product.isNew && <span className="rounded-full border border-gold/40 px-2 py-0.5 text-gold">New</span>}
          {product.isBestseller && <span className="rounded-full border border-cream/20 px-2 py-0.5 text-muted">Bestseller</span>}
          {product.images.length > 0 && (
            <span className="rounded-full border border-cream/20 px-2 py-0.5 text-muted">
              {product.images.length} {product.images.length === 1 ? 'photo' : 'photos'}
            </span>
          )}
          {product.modelUrl && <span className="rounded-full border border-cream/20 px-2 py-0.5 text-muted">3D model</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <Link
          to={`/product/${product.slug}`}
          className="hidden size-11 place-items-center rounded-full text-muted hover:text-cream sm:grid"
          aria-label={`View ${product.name} in the shop`}
        >
          <ExternalLink size={17} aria-hidden />
        </Link>
        <Link
          to={`/admin/products/${product.id}`}
          className="grid size-11 place-items-center rounded-full text-cream hover:text-gold"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil size={17} aria-hidden />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="grid size-11 place-items-center rounded-full text-muted hover:text-danger"
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 size={17} aria-hidden />
        </button>
      </div>
    </li>
  );
}

function ProductsPanel() {
  const { repository, isLoading, error } = useCatalogue();
  const deleteProduct = useDeleteProduct();
  const [pendingDelete, setPendingDelete] = useState<Product>();

  if (error) return <LoadError message={error.message} />;
  if (isLoading) return <Skeleton className="h-96" />;

  const products = repository.getAll();

  const closeDialog = () => {
    setPendingDelete(undefined);
    deleteProduct.reset();
  };

  return (
    <>
      {products.length === 0 ? (
        <div className="hairline rounded-2xl border px-6 py-16 text-center">
          <h3 className="text-3xl">No products yet</h3>
          <p className="mt-2 text-muted">Add your first fragrance to open the shop.</p>
        </div>
      ) : (
        <ul className="hairline border-t">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onDelete={() => setPendingDelete(product)} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== undefined}
        title={`Delete ${pendingDelete?.name ?? 'product'}?`}
        message="It will disappear from the shop and its photos will be deleted. Past orders keep their details. This cannot be undone."
        confirmLabel="Delete product"
        isWorking={deleteProduct.isPending}
        error={deleteProduct.error ? errorMessage(deleteProduct.error) : undefined}
        onCancel={closeDialog}
        onConfirm={() => pendingDelete && deleteProduct.mutate(pendingDelete.id, { onSuccess: closeDialog })}
      />
    </>
  );
}

function OrderStatusSelect({ order }: { order: Order }) {
  const setStatus = useSetOrderStatus();
  return (
    <label>
      <span className="sr-only">Status of order {order.number}</span>
      <select
        value={order.status}
        disabled={setStatus.isPending}
        onChange={(event) => setStatus.mutate({ id: order.id, status: event.target.value as OrderStatus })}
        className="hairline min-h-11 rounded-full border bg-ink-950 px-4 text-sm"
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ORDER_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </label>
  );
}

function OrdersPanel({ orders, isPending, error }: { orders?: Order[]; isPending: boolean; error: Error | null }) {
  if (error) return <LoadError message={error.message} />;
  if (isPending || !orders) return <Skeleton className="h-96" />;

  if (orders.length === 0) {
    return (
      <div className="hairline rounded-2xl border px-6 py-16 text-center">
        <Package size={32} strokeWidth={1.2} className="mx-auto text-gold" aria-hidden />
        <h3 className="mt-4 text-3xl">No orders yet</h3>
        <p className="mt-2 text-muted">Orders from customers will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderSummaryCard
            order={order}
            aside={
              <>
                <span className="text-right text-xs text-muted">
                  <span className="block text-sm text-cream">{order.customer.name}</span>
                  {order.customer.email}
                </span>
                <OrderStatusSelect order={order} />
              </>
            }
          />
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboardPage() {
  usePageTitle('Dashboard');

  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'orders' ? 'orders' : 'products';
  const location = useLocation();
  const navigate = useNavigate();
  const notice = (location.state as { notice?: DashboardNotice } | null)?.notice;

  const { repository } = useCatalogue();
  const orders = useQuery({ queryKey: queryKeys.allOrders, queryFn: orderApi.all });
  const activeOrders = orders.data?.filter((order) => order.status !== 'cancelled') ?? [];
  const revenue = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const toPrepare = activeOrders.filter((order) => order.status === 'pending').length;

  return (
    <div className="container-page pb-24 pt-32 md:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Store admin</p>
          <h1 className="mt-3 text-5xl md:text-7xl">Dashboard</h1>
        </div>
        <ButtonLink to="/admin/products/new" size="lg">
          <Plus size={18} aria-hidden /> Add a product
        </ButtonLink>
      </div>

      {notice && (
        <div className="mt-8">
          <Notice notice={notice} onDismiss={() => navigate(location.pathname + location.search, { replace: true, state: null })} />
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Products" value={repository.getAll().length} />
        <StatTile label="Orders" value={orders.data ? activeOrders.length : '–'} />
        <StatTile label="To prepare" value={orders.data ? toPrepare : '–'} />
        <StatTile label="Revenue" value={orders.data ? formatPrice(revenue) : '–'} />
      </div>

      <div role="tablist" aria-label="Dashboard sections" className="hairline mt-12 flex gap-6 border-b">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setParams(item.id === 'products' ? {} : { tab: item.id }, { replace: true })}
            className={cn(
              '-mb-px min-h-12 border-b-2 text-sm font-semibold uppercase tracking-[0.16em] transition-colors',
              tab === item.id ? 'border-gold text-cream' : 'border-transparent text-muted hover:text-cream',
            )}
          >
            {item.label}
            {item.id === 'orders' && toPrepare > 0 && (
              <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] text-ink-950">{toPrepare}</span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === 'products' ? (
          <ProductsPanel />
        ) : (
          <OrdersPanel orders={orders.data} isPending={orders.isPending} error={orders.error} />
        )}
      </div>
    </div>
  );
}
