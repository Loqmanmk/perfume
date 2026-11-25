import { hashPassword } from '../auth/password.ts';
import type { ServerConfig } from '../config.ts';
import type { ProductRepository } from '../repositories/productRepository.ts';
import type { UserRepository } from '../repositories/userRepository.ts';
import { SEED_PRODUCTS } from './seedProducts.ts';

/** Fills an empty catalogue with the sample fragrances. */
export function seedProducts(products: ProductRepository): void {
  if (products.count() > 0) return;
  for (const product of SEED_PRODUCTS) products.insert({ ...product, images: [], modelUrl: null });
}

/** Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet. */
export async function ensureAdmin(users: UserRepository, admin: ServerConfig['admin']): Promise<void> {
  if (!admin.email || !admin.password) {
    if (users.countByRole('admin') === 0) {
      console.warn(
        '⚠  No admin account. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env (see .env.example) and restart.',
      );
    }
    return;
  }

  if (users.findByEmail(admin.email)) return;

  users.create({
    name: admin.name,
    email: admin.email,
    passwordHash: await hashPassword(admin.password),
    role: 'admin',
  });
  console.info(`✓ Admin account created for ${admin.email}`);
}
