import { Hono, type Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { loginSchema, registerSchema } from '../../src/domain/user.ts';
import { DECOY_HASH, hashPassword, verifyPassword } from '../auth/password.ts';
import { parseWith, readJson, SESSION_COOKIE, type AppEnv } from '../http/context.ts';
import type { SessionRepository } from '../repositories/sessionRepository.ts';
import { toPublicUser, type UserRepository } from '../repositories/userRepository.ts';

interface AuthDependencies {
  users: UserRepository;
  sessions: SessionRepository;
  secureCookies: boolean;
  sessionDays: number;
}

export function authRoutes({ users, sessions, secureCookies, sessionDays }: AuthDependencies) {
  const startSession = (c: Context, userId: string) => {
    setCookie(c, SESSION_COOKIE, sessions.create(userId), {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'Lax',
      path: '/',
      maxAge: sessionDays * 24 * 60 * 60,
    });
  };

  return new Hono<AppEnv>()
    .get('/me', (c) => c.json({ user: c.get('user') }))

    .post('/register', async (c) => {
      const input = parseWith(registerSchema, await readJson(c));

      if (users.findByEmail(input.email)) {
        throw new HTTPException(409, { message: 'An account with this email already exists. Try signing in.' });
      }

      // Public sign-up always creates a customer. Admins are created from the server config only.
      const user = users.create({
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: 'customer',
      });
      startSession(c, user.id);
      return c.json({ user }, 201);
    })

    .post('/login', async (c) => {
      const input = parseWith(loginSchema, await readJson(c));
      const user = users.findByEmail(input.email);
      const isValid = await verifyPassword(input.password, user?.passwordHash ?? DECOY_HASH);

      if (!user || !isValid) {
        throw new HTTPException(401, { message: 'That email and password do not match.' });
      }

      startSession(c, user.id);
      return c.json({ user: toPublicUser(user) });
    })

    .post('/logout', (c) => {
      const token = getCookie(c, SESSION_COOKIE);
      if (token) sessions.delete(token);
      deleteCookie(c, SESSION_COOKIE, { path: '/' });
      return c.body(null, 204);
    });
}
