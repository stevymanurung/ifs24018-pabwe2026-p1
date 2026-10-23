import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from './schema.js';

/** Membuka database (":memory:" untuk pengujian), mengaktifkan pengaturan keamanan, lalu menjalankan skema. */
export function openDatabase(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('foreign_keys = ON');
  if (file !== ':memory:') db.pragma('journal_mode = WAL');
  db.exec(SCHEMA_SQL);
  // Migrasi database lama yang sebelumnya belum menyimpan pemilik data.
  for (const table of ['sessions', 'tasks', 'alarms']) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name);
    if (!columns.includes('user_id')) db.exec(`ALTER TABLE ${table} ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1`);
  }
  const settingsColumns = db.prepare('PRAGMA table_info(settings)').all();
  if (!settingsColumns.some((column) => column.name === 'user_id')) {
    db.exec(`ALTER TABLE settings RENAME TO settings_legacy;
      CREATE TABLE settings (user_id INTEGER NOT NULL DEFAULT 1, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (user_id, key));
      INSERT OR IGNORE INTO settings (user_id, key, value) SELECT 1, key, value FROM settings_legacy;
      DROP TABLE settings_legacy;`);
  }
  return db;
}
