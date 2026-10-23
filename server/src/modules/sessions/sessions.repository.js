const toSession = (row) => ({ id: row.id, course: row.course, day: row.day, start: row.start_time, end: row.end_time, room: row.room });

/** Akses data sesi. Seluruh query memakai parameter terikat (?) sehingga aman dari SQL injection. */
export function createSessionRepository(db) {
  const selectAll = db.prepare('SELECT * FROM sessions ORDER BY day, start_time, id');
  const selectById = db.prepare('SELECT * FROM sessions WHERE id = ?');
  const insert = db.prepare('INSERT INTO sessions (course, day, start_time, end_time, room) VALUES (@course, @day, @start, @end, @room)');
  const deleteById = db.prepare('DELETE FROM sessions WHERE id = ?');

  return {
    findAll: () => selectAll.all().map(toSession),
    findById: (id) => {
      const row = selectById.get(id);
      return row ? toSession(row) : null;
    },
    create(session) {
      const { lastInsertRowid } = insert.run(session);
      return toSession(selectById.get(lastInsertRowid));
    },
    remove: (id) => deleteById.run(id).changes > 0,
  };
}
