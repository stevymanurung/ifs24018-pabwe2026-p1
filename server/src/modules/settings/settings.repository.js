export function createSettingsRepository(db) {
  const select = db.prepare('SELECT value FROM settings WHERE user_id = ? AND key = ?');
  const upsert = db.prepare('INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value');
  return {
    get: (key, userId = 1) => select.get(userId, key)?.value ?? null,
    set: (key, value, userId = 1) => upsert.run(userId, key, String(value)),
  };
}
