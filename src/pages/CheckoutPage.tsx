import { useState, type FormEvent } from 'react';
import { CircleCheck, Info, Lock } from 'lucide-react';
import { BottleArt } from '@/components/product/BottleArt';
import { Button, ButtonLink } from '@/components/ui/Button';
import {
  CHECKOUT_FIELDS,
  createOrderNumber,
  EMPTY_CHECKOUT_VALUES,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutFieldName,
  type CheckoutValues,
} from '@/features/checkout/checkoutForm';
import { useCart, type CartSummary } from '@/features/cart/useCart';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
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
            <div className="grid h-20 w-16 shrink-0 place-items-center rounded-lg bg-ink-800">
              <BottleArt bottle={item.product.bottle} name="" className="h-16" />
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

function Confirmation({ orderNumber, email }: { orderNumber: string; email: string }) {
  return (
    <div className="container-page grid min-h-[85dvh] place-items-center pt-18 text-center">
      <div role="status">
        <CircleCheck size={44} strokeWidth={1.2} className="mx-auto text-gold" aria-hidden />
        <p className="eyebrow mt-6">Order {orderNumber}</p>
        <h1 className="mt-4 text-5xl md:text-7xl">Thank you.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          Your order is confirmed. A receipt is on its way to{' '}
          <span className="text-cream">{email}</span>.
        </p>
        <ButtonLink to="/shop" size="lg" className="mt-9">
          Continue shopping
        </ButtonLink>
      </div>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="container-page grid min-h-[85dvh] place-items-center pt-18 text-center">
      <div>
        <h1 className="text-5xl md:text-6xl">Your bag is empty</h1>
        <p className="mt-4 text-muted">Add a fragrance before checking out.</p>
        <ButtonLink to="/shop" size="lg" className="mt-8">
          Explore the collection
        </ButtonLink>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  usePageTitle('Checkout');

  const cart = useCart();
  const clearCart = useCartStore((state) => state.clear);
  const [values, setValues] = useState<CheckoutValues>(EMPTY_CHECKOUT_VALUES);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [orderNumber, setOrderNumber] = useState<string>();

  if (orderNumber) return <Confirmation orderNumber={orderNumber} email={values.email} />;
  if (cart.items.length === 0) return <EmptyCheckout />;

  const updateField = (name: CheckoutFieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    // Clear the error as soon as the shopper starts fixing it.
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);

    const firstInvalid = CHECKOUT_FIELDS.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid.name}`)?.focus();
      return;
    }

    // Send the order to your backend / payment provider here.
    setOrderNumber(createOrderNumber());
    clearCart();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="container-page pb-24 pt-32 md:pt-40">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-4 text-5xl md:text-7xl">Almost yours</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <form onSubmit={handleSubmit} noValidate aria-label="Delivery details">
          <h2 className="text-3xl">Delivery details</h2>

          <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {CHECKOUT_FIELDS.map((field) => {
              const id = `checkout-${field.name}`;
              const error = errors[field.name];
              return (
                <div key={field.name} className={cn(field.span === 'full' && 'sm:col-span-2')}>
                  <label htmlFor={id} className="text-sm font-semibold">
                    {field.label}
                  </label>
                  <input
                    id={id}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    value={values[field.name]}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={cn(
                      'mt-2 min-h-12 w-full rounded-xl border bg-ink-900 px-4 text-base transition-colors focus:border-gold focus:outline-none',
                      error ? 'border-danger' : 'border-cream/15',
                    )}
                  />
                  {error && (
                    <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hairline mt-8 flex gap-3 rounded-xl border bg-ink-900 p-4 text-sm text-muted">
            <Info size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
            <p>
              This is a demo store: no payment is taken and no order is sent. Connect a payment
              provider to start accepting real orders.
            </p>
          </div>

          <Button type="submit" size="lg" fullWidth className="mt-6">
            <Lock size={15} aria-hidden /> Place order · {formatPrice(cart.total)}
          </Button>
        </form>

        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}
