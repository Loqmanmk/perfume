import { useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, Info, Lock, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ProductThumbnail } from '@/components/product/ProductThumbnail';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, FormAlert, inputClass } from '@/components/ui/form/Field';
import { shippingAddressSchema, type Order, type ShippingAddress } from '@/domain/order';
import type { PublicUser } from '@/domain/user';
import { PageLoader } from '@/features/auth/RequireAuth';
import { useSession } from '@/features/auth/useSession';
import { useCart, type CartSummary } from '@/features/cart/useCart';
import { CHECKOUT_FIELDS, initialShipping } from '@/features/checkout/checkoutForm';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { orderApi } from '@/services/orderApi';
import { useCartStore } from '@/store/cartStore';

function OrderSummary({ cart }: { cart: CartSummary }) {
  return (
    <aside
      className="hairline rounded-3xl border bg-ink-900 p-6 md:p-8 lg:sticky lg:top-24 lg:self-start"
      aria-labelledby="summary-title"
    >
      <h2 id="summary-title" className="text-3xl">
        Order summary
      </h2>

      <ul className="hairline mt-6 divide-y divide-cream/10 border-y">
        {cart.items.map((item) => (
          <li key={item.key} className="flex items-center gap-4 py-4">
            <div className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-800 p-1">
              <ProductThumbnail product={item.product} className="rounded-md" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl">{item.product.name}</p>
              <p className="text-xs text-muted">
                {item.sizeMl} ml · Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="tabular-nums">{cart.shipping === 0 ? 'Free' : formatPrice(cart.shipping)}</dd>
        </div>
        <div className="hairline flex items-baseline justify-between border-t pt-4">
          <dt className="font-semibold">Total</dt>
          <dd className="text-2xl font-semibold tabular-nums">{formatPrice(cart.total)}</dd>
        </div>
      </dl>
    </aside>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return <div className="container-page grid min-h-[85dvh] place-items-center pt-18 text-center">{children}</div>;
}

function Confirmation({ order }: { order: Order }) {
  return (
    <CenteredMessage>
      <div role="status">
        <CircleCheck size={44} strokeWidth={1.2} className="mx-auto text-gold" aria-hidden />
        <p className="eyebrow mt-6">Order {order.number}</p>
        <h1 className="mt-4 text-5xl md:text-7xl">Thank you.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          Your order is confirmed. You can follow it from your account; a receipt goes to{' '}
          <span className="text-cream">{order.shipping.email}</span>.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/account" size="lg">
            View my orders
          </ButtonLink>
          <ButtonLink to="/shop" size="lg" variant="outline">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    </CenteredMessage>
  );
}

function SignInToCheckout() {
  const redirect = encodeURIComponent('/checkout');
  return (
    <CenteredMessage>
      <div className="max-w-md">
        <UserRound size={40} strokeWidth={1.2} className="mx-auto text-gold" aria-hidden />
        <h1 className="mt-5 text-5xl md:text-6xl">Sign in to check out</h1>
        <p className="mt-4 text-muted">
          Your bag is saved. An account lets you follow your order and find it again later.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to={`/login?redirect=${redirect}`} size="lg">
            Sign in
          </ButtonLink>
          <ButtonLink to={`/register?redirect=${redirect}`} size="lg" variant="outline">
            Create an account
          </ButtonLink>
        </div>
      </div>
    </CenteredMessage>
  );
}

function DeliveryForm({ user, cart, onPlaced }: { user: PublicUser; cart: CartSummary; onPlaced: (order: Order) => void }) {
  const queryClient = useQueryClient();
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);

  const placeOrder = useMutation({
    mutationFn: orderApi.place,
    onSuccess: async (order) => {
      clearCart();
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      onPlaced(order);
      window.scrollTo({ top: 0 });
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: initialShipping(user),
  });

  const onSubmit = handleSubmit(async (shipping) => {
    try {
      await placeOrder.mutateAsync({ lines, shipping });
    } catch (error) {
      applyServerErrors(error, setError, 'shipping.');
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Delivery details">
      <h2 className="text-3xl">Delivery details</h2>
      <div className="mt-6">
        <FormAlert message={errors.root?.message} />
      </div>

      <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {CHECKOUT_FIELDS.map((field) => (
          <Field
            key={field.name}
            id={`checkout-${field.name}`}
            label={field.label}
            error={errors[field.name]?.message}
            className={cn(field.span === 'full' && 'sm:col-span-2')}
          >
            {(control) => (
              <input
                {...control}
                {...register(field.name)}
                type={field.type}
                autoComplete={field.autoComplete}
                className={inputClass(!!errors[field.name], 'min-h-12')}
              />
            )}
          </Field>
        ))}
      </div>

      <div className="hairline mt-8 flex gap-3 rounded-xl border bg-ink-900 p-4 text-sm text-muted">
        <Info size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
        <p>
          Your order is saved and appears in your account, but no payment is taken yet. Connect a payment
          provider before accepting real orders.
        </p>
      </div>

      <Button type="submit" size="lg" fullWidth className="mt-6" disabled={isSubmitting}>
        <Lock size={15} aria-hidden /> {isSubmitting ? 'Placing your order…' : `Place order · ${formatPrice(cart.total)}`}
      </Button>
    </form>
  );
}

export function CheckoutPage() {
  usePageTitle('Checkout');

  const cart = useCart();
  const { user, isLoading } = useSession();
  const [placedOrder, setPlacedOrder] = useState<Order>();

  if (placedOrder) return <Confirmation order={placedOrder} />;
  if (isLoading) return <PageLoader />;

  if (cart.items.length === 0) {
    return (
      <CenteredMessage>
        <div>
          <h1 className="text-5xl md:text-6xl">Your bag is empty</h1>
          <p className="mt-4 text-muted">Add a fragrance before checking out.</p>
          <ButtonLink to="/shop" size="lg" className="mt-8">
            Explore the collection
          </ButtonLink>
        </div>
      </CenteredMessage>
    );
  }

  if (!user) return <SignInToCheckout />;

  return (
    <div className="container-page pb-24 pt-32 md:pt-40">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-4 text-5xl md:text-7xl">Almost yours</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <DeliveryForm user={user} cart={cart} onPlaced={setPlacedOrder} />
        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}
