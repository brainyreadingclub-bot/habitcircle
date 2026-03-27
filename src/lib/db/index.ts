import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function backupDb(dbPath: string) {
  if (!fs.existsSync(dbPath)) return;
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(backupDir, `habitcircle-${timestamp}.db`);
  // Keep max 5 backups
  const existing = fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).sort();
  if (existing.length >= 5) {
    fs.unlinkSync(path.join(backupDir, existing[0]));
  }
  fs.copyFileSync(dbPath, backupPath);
}

export function getDb(): Database.Database {
  if (globalThis.__db) return globalThis.__db;

  const dbPath = path.join(process.cwd(), 'habitcircle.db');
  backupDb(dbPath);
  const db = new Database(dbPath);

  // Assign immediately to prevent duplicate connections during concurrent cold-start
  globalThis.__db = db;

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Migrations
  function migrateAddColumn(table: string, column: string, type: string) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (!cols.some(c => c.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      return true;
    }
    return false;
  }

  // habits: sort_order
  if (migrateAddColumn('habits', 'sort_order', 'INTEGER DEFAULT 0')) {
    db.exec(`UPDATE habits SET sort_order = (
      SELECT COUNT(*) FROM habits h2
      WHERE h2.user_id = habits.user_id AND h2.created_at <= habits.created_at AND h2.id < habits.id
    )`);
  }

  // habits: Atomic Habits fields
  migrateAddColumn('habits', 'trigger_time', 'TEXT DEFAULT NULL');
  migrateAddColumn('habits', 'trigger_location', 'TEXT DEFAULT NULL');
  migrateAddColumn('habits', 'smallest_version', 'TEXT DEFAULT NULL');
  migrateAddColumn('habits', 'reward', 'TEXT DEFAULT NULL');

  // users: identity + onboarding tracking
  migrateAddColumn('users', 'identity', 'TEXT DEFAULT NULL');
  migrateAddColumn('users', 'onboarding_completed', 'INTEGER DEFAULT 0');

  return db;
}
