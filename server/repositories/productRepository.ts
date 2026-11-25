import { randomUUID } from 'node:crypto';
import type { Product } from '../../src/domain/product.ts';
import type { ProductInput } from '../../src/domain/productSchema.ts';
import type { Database } from '../db/database.ts';

/** URL-safe slug from a product name: "Rose de Minuit" → "rose-de-minuit". */
export function slugify(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'fragrance'
  );
}

/**
 * Products are stored as validated JSON documents: the catalogue is small, the
 * shape evolves often, and every write goes through `productInputSchema` first.
 */
export class ProductRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  list(): Product[] {
    return this.db
      .prepare('SELECT data FROM products ORDER BY created_at, rowid')
      .all()
      .map((row) => JSON.parse((row as { data: string }).data) as Product);
  }

  findById(id: string): Product | undefined {
    const row = this.db.prepare('SELECT data FROM products WHERE id = ?').get(id);
    return row ? (JSON.parse((row as { data: string }).data) as Product) : undefined;
  }

  count(): number {
    return (this.db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number }).count;
  }

  create(input: ProductInput): Product {
    const product: Product = {
      ...input,
      id: randomUUID(),
      slug: this.uniqueSlug(slugify(input.name)),
      rating: 0,
      reviewCount: 0,
    };
    this.insert(product);
    return product;
  }

  /** Inserts a fully-formed product (used for seeding). */
  insert(product: Product): void {
    const now = new Date().toISOString();
    this.db
      .prepare('INSERT INTO products (id, slug, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(product.id, product.slug, JSON.stringify(product), now, now);
  }

  /** Replaces the editable fields. The id, URL slug and reviews never change. */
  update(id: string, input: ProductInput): Product | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const product: Product = {
      ...input,
      id: existing.id,
      slug: existing.slug,
      rating: existing.rating,
      reviewCount: existing.reviewCount,
    };
    this.db
      .prepare('UPDATE products SET data = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(product), new Date().toISOString(), id);
    return product;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0;
  }

  private uniqueSlug(base: string): string {
    const exists = this.db.prepare('SELECT 1 FROM products WHERE slug = ?');
    let candidate = base;
    for (let suffix = 2; exists.get(candidate); suffix++) candidate = `${base}-${suffix}`;
    return candidate;
  }
}
