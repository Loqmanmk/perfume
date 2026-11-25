import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '../src/domain/product.ts';
import type { ProductFormValues } from '../src/domain/productSchema.ts';
import { createApi } from './app.ts';
import { hashPassword } from './auth/password.ts';
import { openDatabase } from './db/database.ts';
import { seedProducts } from './db/seed.ts';
import { MemoryStorage } from './storage/fileStorage.ts';

const ORIGIN = 'http://localhost';
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

const validProduct = (overrides: Partial<ProductFormValues> = {}): ProductFormValues => ({
  name: 'Fleur de Sel',
  tagline: 'Salt, iris and warm skin.',
  description: 'A mineral iris softened by musk and a pinch of sea salt.',
  family: 'fresh',
  mood: 'serene',
  concentration: 'Eau de Parfum',
  intensity: 3,
  longevity: 4,
  sillage: 2,
  sizes: [
    { ml: 100, price: 180 },
    { ml: 50, price: 120 },
  ],
  notes: { top: ['Sea salt'], heart: ['Iris'], base: ['Musk'] },
  bottle: { shape: 'round', liquidColor: '#4f9db3', glassTint: '#e8f8ff', capColor: '#c7ccd1' },
  images: [],
  modelUrl: null,
  isNew: true,
  isBestseller: false,
  ...overrides,
});

describe('API', () => {
  let storage: MemoryStorage;
  let app: ReturnType<typeof createApi>;

  /** Sends a request as a browser would, carrying the session cookie when given. */
  const request = (path: string, init: RequestInit & { json?: unknown; cookie?: string } = {}) => {
    const headers = new Headers(init.headers);
    headers.set('Origin', ORIGIN);
    if (init.cookie) headers.set('Cookie', init.cookie);
    if (init.json !== undefined) headers.set('Content-Type', 'application/json');
    return app.api.request(`${ORIGIN}${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
  };

  const sessionCookie = (response: Response) => response.headers.get('set-cookie')?.split(';')[0] ?? '';

  const signIn = async (email: string, password: string) =>
    sessionCookie(await request('/auth/login', { method: 'POST', json: { email, password } }));

  const register = async (email = 'client@example.com') =>
    sessionCookie(
      await request('/auth/register', {
        method: 'POST',
        json: { name: 'Client', email, password: 'a-secure-password' },
      }),
    );

  beforeEach(async () => {
    storage = new MemoryStorage();
    app = createApi({
      db: openDatabase(':memory:'),
      storage,
      config: { trustedOrigins: [], secureCookies: false, sessionDays: 1 },
    });
    seedProducts(app.products);
    app.users.create({
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await hashPassword('admin-password'),
      role: 'admin',
    });
  });

  describe('accounts', () => {
    it('always registers new people as customers', async () => {
      const response = await request('/auth/register', {
        method: 'POST',
        json: { name: 'Eve', email: 'eve@example.com', password: 'a-secure-password', role: 'admin' },
      });
      const { user } = (await response.json()) as { user: { role: string } };
      expect(response.status).toBe(201);
      expect(user.role).toBe('customer');
    });

    it('rejects a wrong password without revealing whether the email exists', async () => {
      const wrongPassword = await request('/auth/login', {
        method: 'POST',
        json: { email: 'admin@example.com', password: 'nope' },
      });
      const unknownEmail = await request('/auth/login', {
        method: 'POST',
        json: { email: 'ghost@example.com', password: 'nope' },
      });
      expect(wrongPassword.status).toBe(401);
      expect(await wrongPassword.json()).toEqual(await unknownEmail.json());
    });

    it('returns the signed-in user and forgets them after logout', async () => {
      const cookie = await register();
      const me = (await (await request('/auth/me', { cookie })).json()) as { user: { email: string } };
      expect(me.user.email).toBe('client@example.com');

      await request('/auth/logout', { method: 'POST', cookie });
      expect(await (await request('/auth/me', { cookie })).json()).toEqual({ user: null });
    });
  });

  describe('products', () => {
    it('lets anyone browse the catalogue', async () => {
      const response = await request('/products');
      const { products } = (await response.json()) as { products: Product[] };
      expect(response.status).toBe(200);
      expect(products.length).toBeGreaterThan(0);
    });

    it('refuses product changes from visitors and customers', async () => {
      expect((await request('/products', { method: 'POST', json: validProduct() })).status).toBe(401);

      const cookie = await register();
      expect((await request('/products', { method: 'POST', json: validProduct(), cookie })).status).toBe(403);
    });

    it('lets the admin publish a product, sorting sizes and giving it a slug', async () => {
      const cookie = await signIn('admin@example.com', 'admin-password');
      const response = await request('/products', { method: 'POST', json: validProduct(), cookie });
      const { product } = (await response.json()) as { product: Product };

      expect(response.status).toBe(201);
      expect(product.slug).toBe('fleur-de-sel');
      expect(product.sizes.map((size) => size.ml)).toEqual([50, 100]);

      const { products } = (await (await request('/products')).json()) as { products: Product[] };
      expect(products.some((item) => item.id === product.id)).toBe(true);
    });

    it('explains which field is invalid', async () => {
      const cookie = await signIn('admin@example.com', 'admin-password');
      const response = await request('/products', {
        method: 'POST',
        json: validProduct({ name: '', sizes: [] }),
        cookie,
      });
      const body = (await response.json()) as { fields: Record<string, string> };
      expect(response.status).toBe(400);
      expect(Object.keys(body.fields)).toEqual(expect.arrayContaining(['name', 'sizes']));
    });

    it('deletes the photos of a deleted product', async () => {
      const cookie = await signIn('admin@example.com', 'admin-password');
      const photo = await storage.save(PNG_BYTES, 'png');
      const created = await request('/products', {
        method: 'POST',
        json: validProduct({ images: [photo] }),
        cookie,
      });
      const { product } = (await created.json()) as { product: Product };

      expect((await request(`/products/${product.id}`, { method: 'DELETE', cookie })).status).toBe(204);
      expect(storage.files.has(photo)).toBe(false);
    });
  });

  describe('uploads', () => {
    const upload = (bytes: Uint8Array<ArrayBuffer>, kind: string, cookie: string) => {
      const form = new FormData();
      form.set('kind', kind);
      form.set('file', new File([bytes], 'photo.jpg'));
      return request('/uploads', { method: 'POST', body: form, cookie });
    };

    it('accepts a real image from the admin', async () => {
      const cookie = await signIn('admin@example.com', 'admin-password');
      const response = await upload(PNG_BYTES, 'image', cookie);
      const { url } = (await response.json()) as { url: string };
      expect(response.status).toBe(201);
      expect(url).toMatch(/^\/uploads\/[\w-]+\.png$/);
    });

    it('rejects a file that only pretends to be an image', async () => {
      const cookie = await signIn('admin@example.com', 'admin-password');
      const script = new TextEncoder().encode('<script>alert(1)</script>');
      expect((await upload(script, 'image', cookie)).status).toBe(415);
    });

    it('refuses uploads from customers', async () => {
      const cookie = await register();
      expect((await upload(PNG_BYTES, 'image', cookie)).status).toBe(403);
    });
  });

  describe('orders', () => {
    const shipping = {
      email: 'client@example.com',
      firstName: 'Ada',
      lastName: 'Client',
      address: '1 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
      phone: '',
    };

    it('requires an account to buy', async () => {
      const response = await request('/orders', {
        method: 'POST',
        json: { lines: [{ productId: 'p-001', sizeMl: 50, quantity: 1 }], shipping },
      });
      expect(response.status).toBe(401);
    });

    it('prices the order on the server and shows it to its owner and the admin only', async () => {
      const cookie = await register();
      const response = await request('/orders', {
        method: 'POST',
        json: { lines: [{ productId: 'p-001', sizeMl: 50, quantity: 2 }], shipping },
        cookie,
      });
      const { order } = (await response.json()) as { order: { total: number; shippingFee: number } };

      expect(response.status).toBe(201);
      // Ambre Nocturne 50 ml is €145 in the seed catalogue; €290 qualifies for free shipping.
      expect(order).toMatchObject({ total: 290, shippingFee: 0 });

      const mine = (await (await request('/orders/mine', { cookie })).json()) as { orders: unknown[] };
      expect(mine.orders).toHaveLength(1);

      const otherCustomer = await register('other@example.com');
      const theirs = (await (await request('/orders/mine', { cookie: otherCustomer })).json()) as {
        orders: unknown[];
      };
      expect(theirs.orders).toHaveLength(0);
      expect((await request('/orders', { cookie })).status).toBe(403);

      const admin = await signIn('admin@example.com', 'admin-password');
      const all = (await (await request('/orders', { cookie: admin })).json()) as { orders: unknown[] };
      expect(all.orders).toHaveLength(1);
    });
  });
});
