import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type Database = DatabaseSync;

/**
 * Schema history. Each entry runs exactly once, in order; to change the schema,
 * append a new migration — never edit one that has already shipped.
 */
const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at    TEXT NOT NULL
  );

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE products (
    id         TEXT PRIMARY KEY,
    slug       TEXT NOT NULL UNIQUE,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE orders (
    id           TEXT PRIMARY KEY,
    number       TEXT NOT NULL UNIQUE,
    user_id      TEXT NOT NULL REFERENCES users(id),
    status       TEXT NOT NULL,
    shipping     TEXT NOT NULL,
    subtotal     REAL NOT NULL,
    shipping_fee REAL NOT NULL,
    total        REAL NOT NULL,
    created_at   TEXT NOT NULL
  );
  CREATE INDEX orders_user ON orders(user_id);

  CREATE TABLE order_items (
    order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size_ml      INTEGER NOT NULL,
    unit_price   REAL NOT NULL,
    quantity     INTEGER NOT NULL
  );
  CREATE INDEX order_items_order ON order_items(order_id);
  `,
];

function migrate(db: Database) {
  const { user_version: current } = db.prepare('PRAGMA user_version').get() as { user_version: number };

  MIGRATIONS.slice(current).forEach((sql, index) => {
    transaction(db, () => {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${current + index + 1}`);
    });
  });
}

/** Runs `work` atomically: everything is saved, or nothing is. */
export function transaction<T>(db: Database, work: () => T): T {
  db.exec('BEGIN');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** Opens (creating if needed) the database and brings its schema up to date. Pass `:memory:` in tests. */
export function openDatabase(file: string): Database {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  return db;
}
