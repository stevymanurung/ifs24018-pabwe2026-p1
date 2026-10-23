import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { FormError } from '../../components/ui/FormError.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';
import { usePlanner } from '../../hooks/usePlanner.js';
import { useSubmit } from '../../hooks/useSubmit.js';
import { uniqueCourses } from '../../lib/sessions.js';
import { countPending, filterTasks } from '../../lib/tasks.js';
import { TaskFilter } from './components/TaskFilter.jsx';
import { TaskForm } from './components/TaskForm.jsx';
import { TaskList } from './components/TaskList.jsx';

export default function TasksPage() {
  const { tasks, sessions } = usePlanner();
  const [filter, setFilter] = useState('all');
  // Waktu diambil ulang setiap daftar berubah, cukup akurat untuk penanda "terlambat" (satuan hari).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => new Date(), [tasks.items]);
  const visibleTasks = useMemo(() => filterTasks(tasks.items, filter), [tasks.items, filter]);
  const courses = useMemo(() => uniqueCourses(sessions.items), [sessions.items]);
  const { submit: runRowAction, error: rowError } = useSubmit((operation) => operation());

  const toggleTask = (task) => runRowAction(() => tasks.update(task.id, { done: !task.done }));
  const removeTask = (id) => runRowAction(() => tasks.remove(id));

  return (
    <Card>
      <TaskForm courses={courses} onCreate={tasks.create} />
      <TaskFilter value={filter} onChange={setFilter} />
      <FormError message={rowError} />
      {tasks.status === 'loading' && <LoadingState />}
      {tasks.status === 'error' && <ErrorBanner message={tasks.error.message} onRetry={tasks.reload} />}
      {tasks.status === 'ready' && (
        <>
          <TaskList tasks={visibleTasks} now={now} onToggle={toggleTask} onRemove={removeTask} />
          <p className="mt-3 text-center text-sm text-slate-500">
            {countPending(tasks.items)} tugas belum selesai dari {tasks.items.length}
          </p>
        </>
      )}
    </Card>
  );
}
