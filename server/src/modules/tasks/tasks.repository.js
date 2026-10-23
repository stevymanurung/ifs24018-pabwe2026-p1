const toTask = (row) => ({
  id: row.id,
  title: row.title,
  course: row.course,
  dueDate: row.due_date,
  remindAt: row.remind_at,
  done: row.done === 1,
});

export function createTaskRepository(db) {
  const selectAll = db.prepare('SELECT * FROM tasks ORDER BY done, CASE WHEN due_date = \'\' THEN 1 ELSE 0 END, due_date, id');
  const selectById = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const insert = db.prepare('INSERT INTO tasks (title, course, due_date, remind_at) VALUES (@title, @course, @dueDate, @remindAt)');
  const updateDone = db.prepare('UPDATE tasks SET done = ? WHERE id = ?');
  const deleteById = db.prepare('DELETE FROM tasks WHERE id = ?');

  return {
    findAll: () => selectAll.all().map(toTask),
    findById: (id) => {
      const row = selectById.get(id);
      return row ? toTask(row) : null;
    },
    create(task) {
      const { lastInsertRowid } = insert.run(task);
      return toTask(selectById.get(lastInsertRowid));
    },
    setDone(id, done) {
      if (updateDone.run(done ? 1 : 0, id).changes === 0) return null;
      return toTask(selectById.get(id));
    },
    remove: (id) => deleteById.run(id).changes > 0,
  };
}
