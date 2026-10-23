const toSession = (row) => ({ id: row.id, course: row.course, day: row.day, start: row.start_time, end: row.end_time, room: row.room });

/** Akses data sesi. Seluruh query memakai parameter terikat (?) sehingga aman dari SQL injection. */
export function createSessionRepository(db) {
  const selectAll = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY day, start_time, id');
  const selectById = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?');
  const insert = db.prepare('INSERT INTO sessions (user_id, course, day, start_time, end_time, room) VALUES (@userId, @course, @day, @start, @end, @room)');
  const deleteById = db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?');

  return {
    findAll: (userId = 1) => selectAll.all(userId).map(toSession),
    findById: (id, userId = 1) => {
      const row = selectById.get(id, userId);
      return row ? toSession(row) : null;
    },
    create(session, userId = 1) {
      const { lastInsertRowid } = insert.run({ ...session, userId });
      return toSession(selectById.get(lastInsertRowid, userId));
    },
    remove: (id, userId = 1) => deleteById.run(id, userId).changes > 0,
  };
}
