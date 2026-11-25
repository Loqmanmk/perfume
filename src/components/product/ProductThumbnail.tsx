import { coverImage, type Product } from '@/domain/product';
import { cn } from '@/lib/cn';
import { BottleArt } from './BottleArt';

interface ProductThumbnailProps {
  product: Product;
  className?: string;
  /** Show the product name on the illustrated bottle (when there is no photo). */
  withName?: boolean;
}

/** The product's cover photo, or its illustrated bottle when no photo was uploaded. Decorative. */
export function ProductThumbnail({ product, className, withName = false }: ProductThumbnailProps) {
  const photo = coverImage(product);

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <BottleArt
      bottle={product.bottle}
      name={withName ? product.name : ''}
      className={cn('mx-auto h-full', className)}
    />
  );
}
