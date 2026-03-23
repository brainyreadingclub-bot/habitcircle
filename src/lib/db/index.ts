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

  return db;
}
