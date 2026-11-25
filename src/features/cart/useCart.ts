import { useMemo } from 'react';
import { calculateTotals, type Totals } from '@/domain/pricing';
import { findSize, type Product } from '@/domain/product';
import { useCatalogue } from '@/features/catalogue/useCatalogue';
import type { ProductRepository } from '@/services/productRepository';
import { useCartStore, type CartLine } from '@/store/cartStore';

export interface CartItem {
  key: string;
  product: Product;
  sizeMl: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary extends Totals {
  items: CartItem[];
  itemCount: number;
}

function toCartItem(line: CartLine, catalogue: ProductRepository): CartItem | undefined {
  const product = catalogue.getById(line.productId);
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

/** Joins cart lines with live catalogue data. Lines for removed products are dropped. */
export function summariseCart(lines: readonly CartLine[], catalogue: ProductRepository): CartSummary {
  const items = lines.map((line) => toCartItem(line, catalogue)).filter((item) => item !== undefined);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    ...calculateTotals(subtotal),
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

/** Cart lines joined with live catalogue data and totals. */
export function useCart(): CartSummary {
  const lines = useCartStore((state) => state.lines);
  const { repository } = useCatalogue();
  return useMemo(() => summariseCart(lines, repository), [lines, repository]);
}
