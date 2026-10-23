const toAlarm = (row) => ({
  id: row.id,
  label: row.label,
  time: row.time,
  days: row.days.split(',').map(Number),
  enabled: row.enabled === 1,
});

export function createAlarmRepository(db) {
  const selectAll = db.prepare('SELECT * FROM alarms WHERE user_id = ? ORDER BY time, id');
  const selectById = db.prepare('SELECT * FROM alarms WHERE id = ? AND user_id = ?');
  const insert = db.prepare('INSERT INTO alarms (user_id, label, time, days) VALUES (?, ?, ?, ?)');
  const updateEnabled = db.prepare('UPDATE alarms SET enabled = ? WHERE id = ? AND user_id = ?');
  const deleteById = db.prepare('DELETE FROM alarms WHERE id = ? AND user_id = ?');

  return {
    findAll: (userId = 1) => selectAll.all(userId).map(toAlarm),
    create({ label, time, days }, userId = 1) {
      const { lastInsertRowid } = insert.run(userId, label, time, days.join(','));
      return toAlarm(selectById.get(lastInsertRowid, userId));
    },
    setEnabled(id, enabled, userId = 1) {
      if (updateEnabled.run(enabled ? 1 : 0, id, userId).changes === 0) return null;
      return toAlarm(selectById.get(id, userId));
    },
    remove: (id, userId = 1) => deleteById.run(id, userId).changes > 0,
  };
}
