import { dayIndex, toDateString, toMinutes } from '../../lib/time.js';

/**
 * Mesin pengingat: fungsi murni tanpa timer, DOM, maupun penyimpanan sehingga mudah diuji.
 * Setiap pemicu dihitung sebagai waktu absolut (ms) lalu dibandingkan dengan "sekarang";
 * dengan begitu pengecekan yang terlambat tetap tertangkap dan tidak pernah berbunyi ganda.
 */
export const GRACE_MS = 2 * 60 * 1000;
export const KEEP_FIRED_MS = 2 * 24 * 60 * 60 * 1000;

/** Hari ini dan besok: besok diperlukan untuk pengingat yang mundur melewati tengah malam. */
const DAY_OFFSETS = [0, 1];

/** Menit ke-N pada tanggal tertentu; menit negatif otomatis mundur ke hari sebelumnya. */
const atMinute = (date, minute) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minute).getTime();

const alarmTriggers = (alarms, date) =>
  alarms
    .filter((alarm) => alarm.enabled && alarm.days.includes(dayIndex(date)))
    .map((alarm) => ({
      key: `alarm:${alarm.id}:${toDateString(date)}`,
      title: alarm.label,
      text: `Waktunya: ${alarm.label} (${alarm.time})`,
      triggerMs: atMinute(date, toMinutes(alarm.time)),
    }));

const sessionTriggers = (sessions, date, lead) =>
  sessions
    .filter((session) => session.day === dayIndex(date))
    .map((session) => ({
      key: `session:${session.id}:${toDateString(date)}:${lead}`,
      title: 'Kuliah segera dimulai',
      text: `${session.course} mulai ${session.start}${session.room ? ` di ${session.room}` : ''} (${lead} menit lagi)`,
      triggerMs: atMinute(date, toMinutes(session.start) - lead),
    }));

const taskTriggers = (tasks, date) =>
  tasks
    .filter((task) => !task.done && task.remindAt && task.dueDate === toDateString(date))
    .map((task) => ({
      key: `task:${task.id}:${toDateString(date)}`,
      title: 'Tugas jatuh tempo hari ini',
      text: task.course ? `${task.title} (${task.course})` : task.title,
      triggerMs: atMinute(date, toMinutes(task.remindAt)),
    }));

export function computeTriggers({ alarms = [], sessions = [], tasks = [], lead = 0 }, now) {
  return DAY_OFFSETS.flatMap((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return [
      ...alarmTriggers(alarms, date),
      ...(lead > 0 ? sessionTriggers(sessions, date, lead) : []),
      ...taskTriggers(tasks, date),
    ];
  });
}

/** Pemicu yang jatuh tempo: 0 <= sekarang - pemicu < GRACE_MS dan kuncinya belum tercatat di `fired`. */
export function dueReminders(state, now, fired = {}) {
  const nowMs = now.getTime();
  return computeTriggers(state, now)
    .filter(({ key, triggerMs }) => nowMs - triggerMs >= 0 && nowMs - triggerMs < GRACE_MS && !fired[key])
    .sort((a, b) => a.triggerMs - b.triggerMs);
}

export const makeSnooze = (reminder, now, minutes) => ({
  key: reminder.key,
  title: reminder.title,
  text: reminder.text,
  at: now.getTime() + minutes * 60_000,
});

/** Memisahkan tunda yang sudah waktunya (batas inklusif) dari yang masih menunggu. */
export function splitSnoozes(snoozes, nowMs) {
  return {
    due: snoozes.filter((snooze) => snooze.at <= nowMs),
    pending: snoozes.filter((snooze) => snooze.at > nowMs),
  };
}

/** Membuang catatan "sudah berbunyi" yang lebih tua dari KEEP_FIRED_MS agar penyimpanan tidak membengkak. */
export const pruneFired = (fired, nowMs) =>
  Object.fromEntries(Object.entries(fired).filter(([, firedAt]) => firedAt >= nowMs - KEEP_FIRED_MS));
