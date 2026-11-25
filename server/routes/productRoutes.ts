import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Product } from '../../src/domain/product.ts';
import { productInputSchema } from '../../src/domain/productSchema.ts';
import { parseWith, readJson, requireRole, type AppEnv } from '../http/context.ts';
import type { ProductRepository } from '../repositories/productRepository.ts';
import type { FileStorage } from '../storage/fileStorage.ts';

interface ProductDependencies {
  products: ProductRepository;
  storage: FileStorage;
}

const filesOf = (product: Product) => [...product.images, ...(product.modelUrl ? [product.modelUrl] : [])];

export function productRoutes({ products, storage }: ProductDependencies) {
  /** Deletes uploaded files that a product no longer references. */
  const removeFiles = async (urls: string[]) => {
    await Promise.all(urls.map((url) => storage.delete(url)));
  };

  const notFound = () => new HTTPException(404, { message: 'This product no longer exists.' });

  return new Hono<AppEnv>()
    .get('/', (c) => c.json({ products: products.list() }))

    .post('/', requireRole('admin'), async (c) => {
      const input = parseWith(productInputSchema, await readJson(c));
      return c.json({ product: products.create(input) }, 201);
    })

    .put('/:id', requireRole('admin'), async (c) => {
      const input = parseWith(productInputSchema, await readJson(c));
      const before = products.findById(c.req.param('id'));
      if (!before) throw notFound();

      const after = products.update(before.id, input);
      if (!after) throw notFound();

      const kept = new Set(filesOf(after));
      await removeFiles(filesOf(before).filter((url) => !kept.has(url)));
      return c.json({ product: after });
    })

    .delete('/:id', requireRole('admin'), async (c) => {
      const product = products.findById(c.req.param('id'));
      if (!product || !products.delete(product.id)) throw notFound();

      await removeFiles(filesOf(product));
      return c.body(null, 204);
    });
}
