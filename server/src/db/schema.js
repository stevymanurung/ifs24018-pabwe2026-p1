/** Skema SQLite. `CREATE ... IF NOT EXISTS` membuat migrasi aman dijalankan berulang kali. */
export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    course     TEXT    NOT NULL,
    day        INTEGER NOT NULL CHECK (day BETWEEN 0 AND 6),
    start_time TEXT    NOT NULL,
    end_time   TEXT    NOT NULL,
    room       TEXT    NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    course    TEXT    NOT NULL DEFAULT '',
    due_date  TEXT    NOT NULL DEFAULT '',
    remind_at TEXT    NOT NULL DEFAULT '',
    done      INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS alarms (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    label   TEXT    NOT NULL,
    time    TEXT    NOT NULL,
    days    TEXT    NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
