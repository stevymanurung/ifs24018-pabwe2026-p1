import { toMinutes } from './time.js';

/** Dua sesi bentrok jika pada hari sama dan rentang [mulai, selesai) saling menumpuk. */
export function overlaps(a, b) {
  return a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

export const findConflict = (existing, candidate) => existing.find((session) => overlaps(session, candidate)) ?? null;

export const sortSessions = (sessions) =>
  [...sessions].sort((a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start));

export function sessionMinutes(session) {
  const minutes = toMinutes(session.end) - toMinutes(session.start);
  return Number.isNaN(minutes) || minutes < 0 ? 0 : minutes;
}
