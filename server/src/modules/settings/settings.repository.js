export function createSettingsRepository(db) {
  const select = db.prepare('SELECT value FROM settings WHERE key = ?');
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

  return {
    get: (key) => select.get(key)?.value ?? null,
    set: (key, value) => upsert.run(key, String(value)),
  };
}
