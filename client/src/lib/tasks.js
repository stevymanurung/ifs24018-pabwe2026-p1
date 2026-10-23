import { toDateString } from './time.js';

export const TASK_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'done', label: 'Selesai' },
];

const FILTER_PREDICATES = {
  all: () => true,
  active: (task) => !task.done,
  done: (task) => task.done,
};

export const filterTasks = (tasks, filter) => tasks.filter(FILTER_PREDICATES[filter] ?? FILTER_PREDICATES.all);

/** Terlambat = belum selesai dan tenggat sebelum hari ini (perbandingan tanggal lokal). */
export const isOverdue = (task, now) => Boolean(task.dueDate) && !task.done && task.dueDate < toDateString(now);

export const countPending = (tasks) => tasks.filter((task) => !task.done).length;
