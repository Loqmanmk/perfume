import { Heart } from 'lucide-react';
import type { Product } from '@/domain/product';
import { cn } from '@/lib/cn';
import { useWishlistStore } from '@/store/wishlistStore';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
  const isSaved = useWishlistStore((state) => state.productIds.includes(product.id));
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <button
      type="button"
      onClick={() => toggle(product.id)}
      aria-pressed={isSaved}
      aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.name} ${isSaved ? 'from' : 'to'} wishlist`}
      className={cn(
        'grid size-11 place-items-center rounded-full transition-[color,transform] duration-300 hover:text-gold active:scale-90',
        isSaved ? 'text-gold' : 'text-cream',
        className,
      )}
    >
      <Heart size={18} className={cn(isSaved && 'fill-gold')} aria-hidden />
    </button>
  );
}
