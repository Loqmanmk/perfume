import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import type { ServerConfig } from './config.ts';
import type { Database } from './db/database.ts';
import { loadSession, ValidationError, type AppEnv } from './http/context.ts';
import { OrderRepository } from './repositories/orderRepository.ts';
import { ProductRepository } from './repositories/productRepository.ts';
import { SessionRepository } from './repositories/sessionRepository.ts';
import { UserRepository } from './repositories/userRepository.ts';
import { authRoutes } from './routes/authRoutes.ts';
import { orderRoutes } from './routes/orderRoutes.ts';
import { productRoutes } from './routes/productRoutes.ts';
import { uploadRoutes } from './routes/uploadRoutes.ts';
import type { FileStorage } from './storage/fileStorage.ts';

export interface AppDependencies {
  db: Database;
  storage: FileStorage;
  config: Pick<ServerConfig, 'trustedOrigins' | 'secureCookies' | 'sessionDays'>;
}

/**
 * Builds the API from its dependencies. Nothing here touches the disk or the
 * network directly, so tests can run the whole API against an in-memory database.
 */
export function createApi({ db, storage, config }: AppDependencies) {
  const users = new UserRepository(db);
  const sessions = new SessionRepository(db, config.sessionDays);
  const products = new ProductRepository(db);
  const orders = new OrderRepository(db);

  const api = new Hono<AppEnv>()
    .use(secureHeaders())
    // Rejects form/multipart posts coming from other websites.
    .use(
      csrf({
        origin: (origin, c) => origin === new URL(c.req.url).origin || config.trustedOrigins.includes(origin),
      }),
    )
    .use(loadSession(sessions))
    .route('/auth', authRoutes({ users, sessions, ...config }))
    .route('/products', productRoutes({ products, storage }))
    .route('/uploads', uploadRoutes({ storage }))
    .route('/orders', orderRoutes({ orders, products }));

  api.notFound((c) => c.json({ error: 'Not found.' }, 404));

  api.onError((error, c) => {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message, fields: error.fields }, 400);
    }
    if (error instanceof HTTPException) {
      return c.json({ error: error.message || 'Request failed.' }, error.status);
    }
    console.error(error);
    return c.json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  });

  return { api, users, products, sessions };
}
