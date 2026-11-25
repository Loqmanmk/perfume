import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_QUANTITY_PER_LINE } from '@/domain/order';

export interface CartLine {
  productId: string;
  sizeMl: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (productId: string, sizeMl: number, quantity: number) => void;
  remove: (productId: string, sizeMl: number) => void;
  clear: () => void;
}

const isSameLine = (line: CartLine, productId: string, sizeMl: number) =>
  line.productId === productId && line.sizeMl === sizeMl;

const clampQuantity = (quantity: number) => Math.min(Math.max(quantity, 1), MAX_QUANTITY_PER_LINE);

/** Holds only what the shopper chose. Prices are derived from the catalogue, never stored. */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (incoming) =>
        set((state) => {
          const exists = state.lines.some((line) =>
            isSameLine(line, incoming.productId, incoming.sizeMl),
          );

          if (!exists) {
            return {
              lines: [...state.lines, { ...incoming, quantity: clampQuantity(incoming.quantity) }],
            };
          }

          return {
            lines: state.lines.map((line) =>
              isSameLine(line, incoming.productId, incoming.sizeMl)
                ? { ...line, quantity: clampQuantity(line.quantity + incoming.quantity) }
                : line,
            ),
          };
        }),

      setQuantity: (productId, sizeMl, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            isSameLine(line, productId, sizeMl)
              ? { ...line, quantity: clampQuantity(quantity) }
              : line,
          ),
        })),

      remove: (productId, sizeMl) =>
        set((state) => ({
          lines: state.lines.filter((line) => !isSameLine(line, productId, sizeMl)),
        })),

      clear: () => set({ lines: [] }),
    }),
    { name: 'nuee-cart' },
  ),
);
