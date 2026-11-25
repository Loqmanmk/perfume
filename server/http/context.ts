import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';
import type { PublicUser, Role } from '../../src/domain/user.ts';
import type { SessionRepository } from '../repositories/sessionRepository.ts';

export const SESSION_COOKIE = 'nuee_session';

export interface AppEnv {
  Variables: { user: PublicUser | null };
}

/** A 400 carrying per-field messages the form can show next to each input. */
export class ValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string>) {
    super(message);
    this.fields = fields;
  }
}

/** Validates untrusted input, or throws a `ValidationError` with readable messages. */
export function parseWith<Schema extends z.ZodType>(schema: Schema, data: unknown): z.output<Schema> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || 'form';
    fields[path] ??= issue.message;
  }
  throw new ValidationError(Object.values(fields)[0] ?? 'Please check the form.', fields);
}

export async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Expected a JSON body.' });
  }
}

/** Reads the session cookie and exposes the signed-in user (or null) as `c.get('user')`. */
export const loadSession = (sessions: SessionRepository) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE);
    c.set('user', (token && sessions.findUser(token)) || null);
    await next();
  });

/** The signed-in user, or a 401. */
export function currentUser(c: Context<AppEnv>): PublicUser {
  const user = c.get('user');
  if (!user) throw new HTTPException(401, { message: 'Please sign in to continue.' });
  return user;
}

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  currentUser(c);
  await next();
});

/** Lets the request through only for users with the given role. */
export const requireRole = (role: Role) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (currentUser(c).role !== role) {
      throw new HTTPException(403, { message: 'You do not have permission to do this.' });
    }
    await next();
  });
