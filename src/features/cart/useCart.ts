import { useMemo } from 'react';
import { SITE } from '@/config/site';
import { findSize, type Product } from '@/domain/product';
import { productRepository } from '@/services/productRepository';
import { useCartStore, type CartLine } from '@/store/cartStore';

export interface CartItem {
  key: string;
  product: Product;
  sizeMl: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  /** Amount still missing to unlock free shipping (0 once unlocked). */
  remainingForFreeShipping: number;
}

function toCartItem(line: CartLine): CartItem | undefined {
  const product = productRepository.getById(line.productId);
  const size = product && findSize(product, line.sizeMl);
  if (!product || !size) return undefined;

  return {
    key: `${product.id}-${size.ml}`,
    product,
    sizeMl: size.ml,
    unitPrice: size.price,
    quantity: line.quantity,
    lineTotal: size.price * line.quantity,
  };
}

export function summariseCart(lines: readonly CartLine[]): CartSummary {
  const items = lines.map(toCartItem).filter((item) => item !== undefined);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const qualifiesForFreeShipping = subtotal >= SITE.freeShippingThreshold;
  const shipping = items.length === 0 || qualifiesForFreeShipping ? 0 : SITE.shippingFee;

  return {
    items,
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    remainingForFreeShipping: Math.max(SITE.freeShippingThreshold - subtotal, 0),
  };
}

/** Cart lines joined with live catalogue data and totals. */
export function useCart(): CartSummary {
  const lines = useCartStore((state) => state.lines);
  return useMemo(() => summariseCart(lines), [lines]);
}
