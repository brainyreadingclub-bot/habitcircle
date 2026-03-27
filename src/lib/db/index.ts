import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (globalThis.__db) return globalThis.__db;

  const dbPath = path.join(process.cwd(), 'habitcircle.db');
  const db = new Database(dbPath);

  // Assign immediately to prevent duplicate connections during concurrent cold-start
  globalThis.__db = db;

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Migrations: add sort_order column if missing
  const columns = db.prepare("PRAGMA table_info(habits)").all() as Array<{ name: string }>;
  if (!columns.some(c => c.name === 'sort_order')) {
    db.exec("ALTER TABLE habits ADD COLUMN sort_order INTEGER DEFAULT 0");
    // Initialize sort_order from created_at order per user
    db.exec(`
      UPDATE habits SET sort_order = (
        SELECT COUNT(*) FROM habits h2
        WHERE h2.user_id = habits.user_id AND h2.created_at <= habits.created_at AND h2.id < habits.id
      )
    `);
  }

  return db;
}
