import { useEffect, useRef } from 'react';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { BottleArt } from '@/components/product/BottleArt';
import { Button, ButtonLink } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { SITE } from '@/config/site';
import { formatPrice } from '@/lib/format';
import { useModalBehaviour } from '@/lib/hooks/useModalBehaviour';
import { MAX_QUANTITY_PER_LINE, useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { useCart, type CartItem } from './useCart';

function FreeShippingProgress({ remaining }: { remaining: number }) {
  const progress = 1 - remaining / SITE.freeShippingThreshold;

  return (
    <div className="px-6 pb-5">
      <p className="text-sm text-muted" aria-live="polite">
        {remaining > 0 ? (
          <>
            You are <span className="font-semibold text-cream">{formatPrice(remaining)}</span> away
            from free shipping.
          </>
        ) : (
          <span className="text-gold">You have unlocked free shipping.</span>
        )}
      </p>
      <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-ink-700" aria-hidden>
        <motion.div
          className="h-full origin-left bg-gold"
          initial={false}
          animate={{ scaleX: Math.min(Math.max(progress, 0), 1) }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function CartLineItem({ item, onNavigate }: { item: CartItem; onNavigate: () => void }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const { product, sizeMl } = item;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="hairline flex gap-4 border-b py-5"
    >
      <Link
        to={`/product/${product.slug}`}
        onClick={onNavigate}
        className="grid h-28 w-22 shrink-0 place-items-center rounded-xl bg-ink-800"
        aria-label={product.name}
      >
        <BottleArt bottle={product.bottle} name="" className="h-24" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-xl">{product.name}</h3>
            <p className="text-xs text-muted">
              {product.concentration} · {sizeMl} ml
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(item.lineTotal)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={MAX_QUANTITY_PER_LINE}
            onChange={(quantity) => setQuantity(product.id, sizeMl, quantity)}
            label={`Quantity of ${product.name}, ${sizeMl} ml`}
          />
          <button
            type="button"
            onClick={() => remove(product.id, sizeMl)}
            className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-danger"
            aria-label={`Remove ${product.name}, ${sizeMl} ml from bag`}
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>
      </div>
    </motion.li>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <ShoppingBag size={36} strokeWidth={1.2} className="text-gold" aria-hidden />
      <h3 className="mt-5 text-3xl">Your bag is empty</h3>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Find a fragrance that feels like you — every bottle ships with two complimentary samples.
      </p>
      <ButtonLink to="/shop" onClick={onClose} className="mt-7">
        Explore the collection
      </ButtonLink>
    </div>
  );
}

export function CartDrawer() {
  const isOpen = useUiStore((state) => state.isCartOpen);
  const close = useUiStore((state) => state.closeCart);
  const cart = useCart();
  const panel = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useModalBehaviour(isOpen, close, panel);
  useEffect(() => close(), [pathname, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />

          <motion.aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="hairline absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l bg-ink-900 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h2 id="cart-title" className="text-3xl">
                Your bag{' '}
                {cart.itemCount > 0 && (
                  <span className="font-sans text-sm text-muted">({cart.itemCount})</span>
                )}
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid size-11 place-items-center rounded-full text-cream transition-colors hover:text-gold"
                aria-label="Close bag"
              >
                <X size={22} aria-hidden />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <EmptyCart onClose={close} />
            ) : (
              <>
                <FreeShippingProgress remaining={cart.remainingForFreeShipping} />

                <ul className="hairline flex-1 overflow-y-auto border-t px-6">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <CartLineItem key={item.key} item={item} onNavigate={close} />
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="hairline border-t px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Subtotal</span>
                    <span className="text-xl font-semibold tabular-nums">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">Shipping and taxes calculated at checkout.</p>
                  <ButtonLink to="/checkout" onClick={close} size="lg" fullWidth className="mt-5">
                    Checkout
                  </ButtonLink>
                  <Button variant="ghost" fullWidth onClick={close} className="mt-2">
                    Continue shopping
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
