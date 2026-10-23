import { toDateString } from './time.js';

export const NO_COURSE_LABEL = 'Tanpa mata kuliah';

/** Terlambat = belum selesai dan tenggat SEBELUM hari ini (perbandingan tanggal lokal, bukan UTC). */
export function isOverdue(task, now) {
  return Boolean(task.dueDate) && !task.done && task.dueDate < toDateString(now);
}

export function summarizeStatus(tasks, now) {
  const summary = { done: 0, active: 0, overdue: 0 };
  for (const task of tasks) {
    if (task.done) summary.done += 1;
    else if (isOverdue(task, now)) summary.overdue += 1;
    else summary.active += 1;
  }
  return summary;
}

/** Tugas dikelompokkan per mata kuliah; urut dari terbanyak, lalu menurut nama. */
export function groupByCourse(tasks) {
  const groups = new Map();
  for (const task of tasks) {
    const course = task.course?.trim() || NO_COURSE_LABEL;
    const group = groups.get(course) ?? { course, done: 0, pending: 0 };
    if (task.done) group.done += 1;
    else group.pending += 1;
    groups.set(course, group);
  }
  return [...groups.values()].sort(
    (a, b) => b.done + b.pending - (a.done + a.pending) || a.course.localeCompare(b.course, 'id'),
  );
}

/** Tugas belum selesai dengan tenggat dari hari ini sampai `days` hari ke depan. */
export function upcomingTasks(tasks, now, days = 7) {
  const from = toDateString(now);
  const limit = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const to = toDateString(limit);
  return tasks
    .filter((task) => !task.done && task.dueDate && task.dueDate >= from && task.dueDate <= to)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
