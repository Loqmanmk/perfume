import { randomUUID } from 'node:crypto';
import type { PublicUser, Role } from '../../src/domain/user.ts';
import type { Database } from '../db/database.ts';

export interface UserRecord extends PublicUser {
  passwordHash: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: Role;
}

const toRecord = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  passwordHash: row.password_hash,
});

export const toPublicUser = ({ id, name, email, role }: PublicUser): PublicUser => ({
  id,
  name,
  email,
  role,
});

export class UserRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  findByEmail(email: string): UserRecord | undefined {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    return row ? toRecord(row as unknown as UserRow) : undefined;
  }

  create(user: { name: string; email: string; passwordHash: string; role: Role }): PublicUser {
    const id = randomUUID();
    this.db
      .prepare('INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, user.email.toLowerCase(), user.name, user.passwordHash, user.role, new Date().toISOString());
    return { id, name: user.name, email: user.email.toLowerCase(), role: user.role };
  }

  countByRole(role: Role): number {
    const row = this.db.prepare('SELECT COUNT(*) AS count FROM users WHERE role = ?').get(role) as {
      count: number;
    };
    return row.count;
  }
}
