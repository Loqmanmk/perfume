import { randomBytes, randomUUID } from 'node:crypto';
import type { Order, OrderItem, OrderStatus, ShippingAddress } from '../../src/domain/order.ts';
import { transaction, type Database } from '../db/database.ts';

interface OrderRow {
  id: string;
  number: string;
  status: OrderStatus;
  shipping: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
}

interface ItemRow {
  order_id: string;
  product_id: string;
  product_name: string;
  size_ml: number;
  unit_price: number;
  quantity: number;
}

export interface NewOrder {
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shipping: ShippingAddress;
}

const ORDER_SELECT = `
  SELECT o.*, u.name AS customer_name, u.email AS customer_email
  FROM orders o JOIN users u ON u.id = o.user_id`;

/** Short, human-friendly order reference, e.g. "NU-7K2QXA". */
const orderNumber = () =>
  `NU-${randomBytes(4).readUInt32BE().toString(36).toUpperCase().padStart(6, '0').slice(-6)}`;

export class OrderRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  create(order: NewOrder): Order {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    transaction(this.db, () => {
      this.db
        .prepare(
          `INSERT INTO orders (id, number, user_id, status, shipping, subtotal, shipping_fee, total, created_at)
           VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
        )
        .run(
          id,
          this.uniqueNumber(),
          order.userId,
          JSON.stringify(order.shipping),
          order.subtotal,
          order.shippingFee,
          order.total,
          createdAt,
        );

      const insertItem = this.db.prepare(
        `INSERT INTO order_items (order_id, product_id, product_name, size_ml, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      for (const item of order.items) {
        insertItem.run(id, item.productId, item.productName, item.sizeMl, item.unitPrice, item.quantity);
      }
    });

    // Safe: the row was inserted just above, inside the same connection.
    return this.findById(id) as Order;
  }

  findById(id: string): Order | undefined {
    const row = this.db.prepare(`${ORDER_SELECT} WHERE o.id = ?`).get(id);
    return row ? this.hydrate([row as unknown as OrderRow])[0] : undefined;
  }

  listByUser(userId: string): Order[] {
    const rows = this.db.prepare(`${ORDER_SELECT} WHERE o.user_id = ? ORDER BY o.created_at DESC`).all(userId);
    return this.hydrate(rows as unknown as OrderRow[]);
  }

  listAll(): Order[] {
    const rows = this.db.prepare(`${ORDER_SELECT} ORDER BY o.created_at DESC`).all();
    return this.hydrate(rows as unknown as OrderRow[]);
  }

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    const { changes } = this.db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return changes > 0 ? this.findById(id) : undefined;
  }

  /** Loads all items for the given orders in one query, then attaches them. */
  private hydrate(rows: OrderRow[]): Order[] {
    if (rows.length === 0) return [];

    const placeholders = rows.map(() => '?').join(', ');
    const itemRows = this.db
      .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY rowid`)
      .all(...rows.map((row) => row.id)) as unknown as ItemRow[];

    const itemsByOrder = Map.groupBy(itemRows, (item) => item.order_id);

    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      status: row.status,
      createdAt: row.created_at,
      subtotal: row.subtotal,
      shippingFee: row.shipping_fee,
      total: row.total,
      shipping: JSON.parse(row.shipping) as ShippingAddress,
      customer: { id: row.user_id, name: row.customer_name, email: row.customer_email },
      items: (itemsByOrder.get(row.id) ?? []).map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        sizeMl: item.size_ml,
        unitPrice: item.unit_price,
        quantity: item.quantity,
      })),
    }));
  }

  private uniqueNumber(): string {
    const exists = this.db.prepare('SELECT 1 FROM orders WHERE number = ?');
    let candidate = orderNumber();
    while (exists.get(candidate)) candidate = orderNumber();
    return candidate;
  }
}
