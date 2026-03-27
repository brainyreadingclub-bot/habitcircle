import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 10;

/**
 * Create a timestamped backup of the DB file.
 * Called on every getDb() initialization AND exported for external use.
 */
export function backupDb(dbPath: string, prefix = 'auto') {
  if (!fs.existsSync(dbPath)) return null;
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `${prefix}-${timestamp}.db`);
  fs.copyFileSync(dbPath, backupPath);

  // Keep max N backups per prefix
  const existing = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith(prefix + '-') && f.endsWith('.db'))
    .sort();
  while (existing.length > MAX_BACKUPS) {
    const oldest = existing.shift()!;
    fs.unlinkSync(path.join(BACKUP_DIR, oldest));
  }

  return backupPath;
}

export function getDb(): Database.Database {
  if (globalThis.__db) return globalThis.__db;

  const dbPath = path.join(process.cwd(), 'habitcircle.db');

  // Backup existing DB before any operations
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
  if (migrateAddColumn('users', 'onboarding_completed', 'INTEGER DEFAULT 0')) {
    // Fix: existing users with habits should not be forced into onboarding
    db.exec(`UPDATE users SET onboarding_completed = 1 WHERE id IN (SELECT DISTINCT user_id FROM habits WHERE is_active = 1)`);
  }

  return db;
}
