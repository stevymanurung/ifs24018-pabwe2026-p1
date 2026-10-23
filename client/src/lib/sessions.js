import { DAY_NAMES } from './time.js';

/** Mengelompokkan sesi per hari (indeks 0-6) dengan mempertahankan urutan masukan. */
export function groupSessionsByDay(sessions) {
  return DAY_NAMES.map((name, day) => ({ day, name, sessions: sessions.filter((session) => session.day === day) }));
}

/** Daftar nama mata kuliah unik, dipakai sebagai saran pada formulir tugas. */
export const uniqueCourses = (sessions) => [...new Set(sessions.map((session) => session.course))];
