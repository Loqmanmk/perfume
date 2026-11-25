import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { WishlistButton } from '@/components/product/WishlistButton';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { MAX_QUANTITY_PER_LINE } from '@/domain/order';
import { defaultSize, findSize, type Product } from '@/domain/product';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';

const CONFIRMATION_MS = 1800;

/** Size, quantity and add-to-bag for one product. */
export function PurchasePanel({ product }: { product: Product }) {
  const [sizeMl, setSizeMl] = useState(defaultSize(product).ml);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addToCart = useCartStore((state) => state.add);
  const openCart = useUiStore((state) => state.openCart);

  const size = findSize(product, sizeMl) ?? defaultSize(product);

  const handleAdd = () => {
    addToCart({ productId: product.id, sizeMl: size.ml, quantity });
    setJustAdded(true);
    openCart();
    window.setTimeout(() => setJustAdded(false), CONFIRMATION_MS);
  };

  return (
    <div>
      <p className="text-3xl font-semibold tabular-nums" aria-live="polite">
        {formatPrice(size.price * quantity)}
      </p>

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold">Size</legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {product.sizes.map((option) => {
            const isSelected = option.ml === size.ml;
            return (
              <label
                key={option.ml}
                className={cn(
                  'flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-xl border text-sm transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold-soft',
                  isSelected ? 'border-gold bg-gold/10' : 'border-cream/15 hover:border-cream/40',
                )}
              >
                <input
                  type="radio"
                  name="size"
                  value={option.ml}
                  checked={isSelected}
                  onChange={() => setSizeMl(option.ml)}
                  className="sr-only"
                />
                <span className="font-semibold">{option.ml} ml</span>
                <span className="text-xs text-muted">{formatPrice(option.price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 flex items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={MAX_QUANTITY_PER_LINE}
          label={`Quantity of ${product.name}`}
        />
        <Button size="lg" onClick={handleAdd} className="flex-1 px-5">
          {justAdded ? (
            <>
              <Check size={16} aria-hidden /> Added
            </>
          ) : (
            <>
              <ShoppingBag size={16} aria-hidden /> Add to bag
            </>
          )}
        </Button>
        <WishlistButton product={product} className="hairline size-14 shrink-0 border" />
      </div>
    </div>
  );
}
