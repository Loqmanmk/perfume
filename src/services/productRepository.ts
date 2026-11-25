import type { Product } from '@/domain/product';

/**
 * Read-only queries over the catalogue. UI code depends on this interface, not
 * on where the products come from.
 */
export interface ProductRepository {
  getAll(): readonly Product[];
  getById(id: string): Product | undefined;
  getBySlug(slug: string): Product | undefined;
  getBestsellers(): readonly Product[];
  getRelated(product: Product, limit: number): readonly Product[];
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly products: readonly Product[];
  private readonly byId: ReadonlyMap<string, Product>;
  private readonly bySlug: ReadonlyMap<string, Product>;

  constructor(products: readonly Product[]) {
    this.products = products;
    this.byId = new Map(products.map((product) => [product.id, product]));
    this.bySlug = new Map(products.map((product) => [product.slug, product]));
  }

  getAll(): readonly Product[] {
    return this.products;
  }

  getById(id: string): Product | undefined {
    return this.byId.get(id);
  }

  getBySlug(slug: string): Product | undefined {
    return this.bySlug.get(slug);
  }

  getBestsellers(): readonly Product[] {
    return this.products.filter((product) => product.isBestseller);
  }

  /** Same family first, then same mood, never the product itself. */
  getRelated(product: Product, limit: number): readonly Product[] {
    const score = (candidate: Product) =>
      (candidate.family === product.family ? 2 : 0) + (candidate.mood === product.mood ? 1 : 0);

    return this.products
      .filter((candidate) => candidate.id !== product.id)
      .toSorted((a, b) => score(b) - score(a))
      .slice(0, limit);
  }
}
