import { z } from 'zod';

export const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const MAX_QUANTITY_PER_LINE = 10;

const required = (message: string) => z.string().trim().min(1, message).max(120);

export const shippingAddressSchema = z.object({
  email: z.email('Enter a valid email, like name@example.com.').trim(),
  firstName: required('Enter your first name.'),
  lastName: required('Enter your last name.'),
  address: required('Enter your street address.'),
  city: required('Enter your city.'),
  postalCode: required('Enter your postal code.'),
  country: required('Enter your country.'),
  phone: z.string().trim().max(40),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/** The shopper only says *what* they want; prices are always computed on the server. */
export const orderInputSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        sizeMl: z.number().int().positive(),
        quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
      }),
    )
    .min(1, 'Your bag is empty.')
    .max(30),
  shipping: shippingAddressSchema,
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export interface OrderItem {
  productId: string;
  productName: string;
  sizeMl: number;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shipping: ShippingAddress;
  customer: { id: string; name: string; email: string };
}

export const orderStatusUpdateSchema = z.object({ status: z.enum(ORDER_STATUSES) });
