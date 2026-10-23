const toTask = (row) => ({
  id: row.id,
  title: row.title,
  course: row.course,
  dueDate: row.due_date,
  remindAt: row.remind_at,
  done: row.done === 1,
});

export function createTaskRepository(db) {
  const selectAll = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY done, CASE WHEN due_date = \'\' THEN 1 ELSE 0 END, due_date, id');
  const selectById = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
  const insert = db.prepare('INSERT INTO tasks (user_id, title, course, due_date, remind_at) VALUES (@userId, @title, @course, @dueDate, @remindAt)');
  const updateDone = db.prepare('UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?');
  const deleteById = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');

  return {
    findAll: (userId = 1) => selectAll.all(userId).map(toTask),
    findById: (id, userId = 1) => {
      const row = selectById.get(id, userId);
      return row ? toTask(row) : null;
    },
    create(task, userId = 1) {
      const { lastInsertRowid } = insert.run({ ...task, userId });
      return toTask(selectById.get(lastInsertRowid, userId));
    },
    setDone(id, done, userId = 1) {
      if (updateDone.run(done ? 1 : 0, id, userId).changes === 0) return null;
      return toTask(selectById.get(id, userId));
    },
    remove: (id, userId = 1) => deleteById.run(id, userId).changes > 0,
  };
}
