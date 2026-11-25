import { createHash, randomBytes } from 'node:crypto';
import type { PublicUser, Role } from '../../src/domain/user.ts';
import type { Database } from '../db/database.ts';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Only a hash of the token is stored, so a leaked database cannot be used to log in. */
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export class SessionRepository {
  private readonly db: Database;
  private readonly lifetimeDays: number;

  constructor(db: Database, lifetimeDays: number) {
    this.db = db;
    this.lifetimeDays = lifetimeDays;
  }

  /** Starts a session and returns the secret token to put in the cookie. */
  create(userId: string): string {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.lifetimeDays * DAY_MS).toISOString();
    this.db
      .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .run(hashToken(token), userId, expiresAt);
    return token;
  }

  findUser(token: string): PublicUser | undefined {
    const row = this.db
      .prepare(
        `SELECT u.id, u.name, u.email, u.role FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(hashToken(token), new Date().toISOString());
    return row ? (row as unknown as { id: string; name: string; email: string; role: Role }) : undefined;
  }

  delete(token: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  }

  deleteExpired(): void {
    this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
  }
}
