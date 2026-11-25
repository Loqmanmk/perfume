import { SITE } from '../config/site.ts';

export interface Totals {
  subtotal: number;
  shipping: number;
  total: number;
  /** Amount still missing to unlock free shipping (0 once unlocked). */
  remainingForFreeShipping: number;
}

/** Shipping rules, shared by the bag (to display) and the server (to charge). */
export function calculateTotals(subtotal: number): Totals {
  const isEmpty = subtotal <= 0;
  const qualifiesForFreeShipping = subtotal >= SITE.freeShippingThreshold;
  const shipping = isEmpty || qualifiesForFreeShipping ? 0 : SITE.shippingFee;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    remainingForFreeShipping: Math.max(SITE.freeShippingThreshold - subtotal, 0),
  };
}
