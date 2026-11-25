import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

/** All runtime settings, read once from the environment (see `.env.example`). */
export interface ServerConfig {
  port: number;
  databaseFile: string;
  uploadsDir: string;
  clientDir: string;
  /** Origins allowed to send form posts (the Vite dev server in development). */
  trustedOrigins: string[];
  secureCookies: boolean;
  sessionDays: number;
  admin: { name: string; email: string | undefined; password: string | undefined };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    // API_PORT wins so a dev tool's PORT (meant for Vite) is not picked up; hosts usually set PORT.
    port: Number(env.API_PORT ?? env.PORT ?? 8787),
    databaseFile: env.DATABASE_FILE ?? join(projectRoot, 'server', 'data', 'nuee.db'),
    uploadsDir: env.UPLOADS_DIR ?? join(projectRoot, 'server', 'data', 'uploads'),
    clientDir: join(projectRoot, 'dist'),
    trustedOrigins: (env.APP_ORIGIN ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()),
    secureCookies: env.NODE_ENV === 'production',
    sessionDays: 30,
    admin: {
      name: env.ADMIN_NAME ?? 'Store admin',
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    },
  };
}
