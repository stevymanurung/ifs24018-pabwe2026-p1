import { DAY_NAMES, dayIndex, toDateString, toMinutes } from './time.js';
import { sessionMinutes, sortSessions } from './sessions.js';
import { groupByCourse, summarizeStatus, upcomingTasks } from './tasks.js';

const round2 = (value) => Math.round(value * 100) / 100;

/** Kuliah terdekat setelah `now`, menelusuri hari ini sampai 7 hari ke depan. */
export function findNextSession(sessions, now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (let ahead = 0; ahead <= 7; ahead += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
    const candidates = sortSessions(sessions.filter((session) => session.day === dayIndex(date)));
    const found = candidates.find((session) => ahead > 0 || toMinutes(session.start) > nowMinutes);
    if (found) return { session: found, daysAhead: ahead };
  }
  return null;
}

/** Menyusun seluruh data dashboard dari data mentah. Fungsi murni: hasilnya hanya bergantung pada argumen. */
export function buildDashboard({ sessions, tasks, now }) {
  const minutesPerDay = DAY_NAMES.map((_, day) =>
    sessions.filter((session) => session.day === day).reduce((sum, session) => sum + sessionMinutes(session), 0),
  );
  const status = summarizeStatus(tasks, now);
  const today = dayIndex(now);

  return {
    date: toDateString(now),
    totals: {
      pending: status.active + status.overdue,
      done: status.done,
      overdue: status.overdue,
      weeklyHours: round2(minutesPerDay.reduce((a, b) => a + b, 0) / 60),
    },
    hoursPerDay: DAY_NAMES.map((name, day) => ({ day, name, hours: round2(minutesPerDay[day] / 60) })),
    taskStatus: [
      { key: 'done', label: 'Selesai', value: status.done },
      { key: 'active', label: 'Aktif', value: status.active },
      { key: 'overdue', label: 'Terlambat', value: status.overdue },
    ],
    tasksPerCourse: groupByCourse(tasks),
    today: {
      dayIndex: today,
      dayName: DAY_NAMES[today],
      sessions: sortSessions(sessions.filter((session) => session.day === today)),
    },
    upcomingTasks: upcomingTasks(tasks, now, 7),
    nextSession: findNextSession(sessions, now),
  };
}
