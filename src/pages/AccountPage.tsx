import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonLink } from '@/components/ui/Button';
import { LoadError, Skeleton } from '@/components/ui/Skeleton';
import { useLogout, useSession } from '@/features/auth/useSession';
import { OrderSummaryCard } from '@/features/orders/OrderSummaryCard';
import { queryKeys } from '@/lib/api/queryClient';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { orderApi } from '@/services/orderApi';

function MyOrders() {
  const { data: orders, isPending, error } = useQuery({ queryKey: queryKeys.myOrders, queryFn: orderApi.mine });

  if (isPending) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading orders">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (error) return <LoadError message={error.message} />;

  if (orders.length === 0) {
    return (
      <div className="hairline rounded-2xl border px-6 py-16 text-center">
        <Package size={32} strokeWidth={1.2} className="mx-auto text-gold" aria-hidden />
        <h3 className="mt-4 text-3xl">No orders yet</h3>
        <p className="mt-2 text-muted">When you place an order, you can follow it here.</p>
        <ButtonLink to="/shop" className="mt-7">
          Explore the collection
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderSummaryCard order={order} />
        </li>
      ))}
    </ul>
  );
}

export function AccountPage() {
  usePageTitle('Your account');

  const { user, isAdmin } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();

  const signOut = () => {
    // Leave this protected page first, or its guard would redirect to the sign-in form.
    navigate('/', { replace: true, flushSync: true });
    logout.mutate();
  };

  return (
    <div className="container-page pb-24 pt-36 md:pt-44">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-4 text-5xl md:text-7xl">Bonjour, {user?.name.split(' ')[0]}</h1>
          <p className="mt-3 text-muted">{user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <ButtonLink to="/admin">
              <LayoutDashboard size={16} aria-hidden /> Dashboard
            </ButtonLink>
          )}
          <Button variant="outline" onClick={signOut} disabled={logout.isPending}>
            <LogOut size={16} aria-hidden /> Sign out
          </Button>
        </div>
      </div>

      <section className="mt-16 max-w-3xl" aria-labelledby="orders-title">
        <h2 id="orders-title" className="text-4xl">
          Your orders
        </h2>
        <div className="mt-8">
          <MyOrders />
        </div>
      </section>
    </div>
  );
}
