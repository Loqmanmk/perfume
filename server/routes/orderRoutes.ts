import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { orderInputSchema, orderStatusUpdateSchema, type OrderItem } from '../../src/domain/order.ts';
import { calculateTotals } from '../../src/domain/pricing.ts';
import { findSize } from '../../src/domain/product.ts';
import { currentUser, parseWith, readJson, requireRole, requireUser, type AppEnv } from '../http/context.ts';
import type { OrderRepository } from '../repositories/orderRepository.ts';
import type { ProductRepository } from '../repositories/productRepository.ts';

interface OrderDependencies {
  orders: OrderRepository;
  products: ProductRepository;
}

export function orderRoutes({ orders, products }: OrderDependencies) {
  /** Prices every line from the catalogue. Whatever the browser claims a bottle costs is ignored. */
  const priceLines = (lines: { productId: string; sizeMl: number; quantity: number }[]): OrderItem[] =>
    lines.map((line) => {
      const product = products.findById(line.productId);
      const size = product && findSize(product, line.sizeMl);
      if (!product || !size) {
        throw new HTTPException(409, {
          message: 'An item in your bag is no longer available. Please review your bag.',
        });
      }
      return {
        productId: product.id,
        productName: product.name,
        sizeMl: size.ml,
        unitPrice: size.price,
        quantity: line.quantity,
      };
    });

  return new Hono<AppEnv>()
    .post('/', requireUser, async (c) => {
      const input = parseWith(orderInputSchema, await readJson(c));
      const items = priceLines(input.lines);
      const totals = calculateTotals(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));

      // Connect a payment provider here (e.g. a Stripe PaymentIntent) before saving the order.
      const order = orders.create({
        userId: currentUser(c).id,
        items,
        subtotal: totals.subtotal,
        shippingFee: totals.shipping,
        total: totals.total,
        shipping: input.shipping,
      });
      return c.json({ order }, 201);
    })

    .get('/mine', requireUser, (c) => c.json({ orders: orders.listByUser(currentUser(c).id) }))

    .get('/', requireRole('admin'), (c) => c.json({ orders: orders.listAll() }))

    .patch('/:id', requireRole('admin'), async (c) => {
      const { status } = parseWith(orderStatusUpdateSchema, await readJson(c));
      const order = orders.updateStatus(c.req.param('id'), status);
      if (!order) throw new HTTPException(404, { message: 'Order not found.' });
      return c.json({ order });
    });
}
