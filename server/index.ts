import { existsSync, mkdirSync } from 'node:fs';
import { relative } from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { createApi } from './app.ts';
import { loadConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { ensureAdmin, seedProducts } from './db/seed.ts';
import { LocalDiskStorage, UPLOADS_PREFIX } from './storage/fileStorage.ts';

const config = loadConfig();
mkdirSync(config.uploadsDir, { recursive: true });
const db = openDatabase(config.databaseFile);
const storage = new LocalDiskStorage(config.uploadsDir);
const { api, users, products, sessions } = createApi({ db, storage, config });

seedProducts(products);
await ensureAdmin(users, config.admin);
sessions.deleteExpired();

// serveStatic resolves `root` relative to the working directory.
const fromCwd = (path: string) => relative(process.cwd(), path) || '.';

const server = new Hono()
  .route('/api', api)
  .use(
    `${UPLOADS_PREFIX}/*`,
    async (c, next) => {
      await next();
      // File names are random UUIDs and never reused, so they can be cached forever.
      if (c.res.ok) c.header('Cache-Control', 'public, max-age=31536000, immutable');
      c.header('X-Content-Type-Options', 'nosniff');
    },
    serveStatic({
      root: fromCwd(config.uploadsDir),
      rewriteRequestPath: (path) => path.slice(UPLOADS_PREFIX.length),
    }),
  );

// In production the same server also serves the built storefront (run `npm run build` first).
if (existsSync(config.clientDir)) {
  const clientRoot = fromCwd(config.clientDir);
  server.use('/*', serveStatic({ root: clientRoot }));
  server.get('*', serveStatic({ root: clientRoot, path: 'index.html' }));
}

serve({ fetch: server.fetch, port: config.port }, ({ port }) => {
  console.info(`✓ API listening on http://localhost:${port}`);
});
