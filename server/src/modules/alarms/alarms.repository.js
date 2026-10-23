const toAlarm = (row) => ({
  id: row.id,
  label: row.label,
  time: row.time,
  days: row.days.split(',').map(Number),
  enabled: row.enabled === 1,
});

export function createAlarmRepository(db) {
  const selectAll = db.prepare('SELECT * FROM alarms ORDER BY time, id');
  const selectById = db.prepare('SELECT * FROM alarms WHERE id = ?');
  const insert = db.prepare('INSERT INTO alarms (label, time, days) VALUES (?, ?, ?)');
  const updateEnabled = db.prepare('UPDATE alarms SET enabled = ? WHERE id = ?');
  const deleteById = db.prepare('DELETE FROM alarms WHERE id = ?');

  return {
    findAll: () => selectAll.all().map(toAlarm),
    create({ label, time, days }) {
      const { lastInsertRowid } = insert.run(label, time, days.join(','));
      return toAlarm(selectById.get(lastInsertRowid));
    },
    setEnabled(id, enabled) {
      if (updateEnabled.run(enabled ? 1 : 0, id).changes === 0) return null;
      return toAlarm(selectById.get(id));
    },
    remove: (id) => deleteById.run(id).changes > 0,
  };
}
