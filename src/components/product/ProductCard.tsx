import { Plus, Rotate3d } from 'lucide-react';
import { Link } from 'react-router-dom';
import { coverImage, defaultSize, FAMILY_LABELS, startingPrice, type Product } from '@/domain/product';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { ProductThumbnail } from './ProductThumbnail';
import { WishlistButton } from './WishlistButton';

function badgeFor(product: Product): string | undefined {
  if (product.isNew) return 'New';
  if (product.isBestseller) return 'Bestseller';
  return undefined;
}

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.add);
  const openCart = useUiStore((state) => state.openCart);
  const badge = badgeFor(product);
  const quickAddSize = defaultSize(product);
  const hasPhoto = coverImage(product) !== undefined;

  const handleQuickAdd = () => {
    addToCart({ productId: product.id, sizeMl: quickAddSize.ml, quantity: 1 });
    openCart();
  };

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-ink-800">
        {/* Colour wash in the perfume's own hue */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-55"
          style={{
            background: `radial-gradient(circle at 50% 62%, ${product.bottle.liquidColor}, transparent 68%)`,
          }}
        />

        <Link
          to={`/product/${product.slug}`}
          className={cn('relative block aspect-[4/5]', !hasPhoto && 'p-8')}
          aria-label={`${product.name}, ${FAMILY_LABELS[product.family]}, from ${formatPrice(startingPrice(product))}`}
        >
          <ProductThumbnail
            product={product}
            withName
            className="transition-transform duration-700 ease-luxe group-hover:scale-105"
          />
        </Link>

        {badge && (
          <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-ink-950/40 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
            {badge}
          </span>
        )}

        <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-ink-950/50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cream/80 backdrop-blur">
          <Rotate3d size={12} aria-hidden /> 360°
        </span>

        <WishlistButton product={product} className="absolute right-2 top-2" />

        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name}, ${quickAddSize.ml} ml, to bag`}
          className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-cream text-ink-950 transition-[background-color,transform] duration-300 hover:bg-gold active:scale-90"
        >
          <Plus size={18} aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl">{product.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
            {FAMILY_LABELS[product.family]} · {product.concentration}
          </p>
        </div>
        <p className="shrink-0 pt-1 text-sm">
          <span className="text-muted">from </span>
          <span className="font-semibold tabular-nums">{formatPrice(startingPrice(product))}</span>
        </p>
      </div>
    </article>
  );
}
