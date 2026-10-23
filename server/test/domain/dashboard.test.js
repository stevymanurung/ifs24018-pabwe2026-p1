import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboard, findNextSession } from '../../src/domain/dashboard.js';

const NOW = new Date(2026, 9, 19, 10, 0); // Senin 10:00
const s = (id, course, day, start, end) => ({ id, course, day, start, end, room: '' });

test('data kosong menghasilkan nol, bukan NaN atau error', () => {
  const d = buildDashboard({ sessions: [], tasks: [], now: NOW });
  assert.deepEqual(d.totals, { pending: 0, done: 0, overdue: 0, weeklyHours: 0 });
  assert.equal(d.hoursPerDay.length, 7);
  assert.equal(d.nextSession, null);
});

test('jam belajar memperhitungkan menit dan dijumlahkan per hari', () => {
  const d = buildDashboard({
    sessions: [s(1, 'A', 0, '08:00', '10:00'), s(2, 'B', 0, '10:00', '12:30'), s(3, 'C', 2, '08:00', '09:40')],
    tasks: [], now: NOW,
  });
  assert.deepEqual(d.hoursPerDay.map((x) => x.hours).slice(0, 3), [4.5, 0, 1.67]);
  assert.equal(d.totals.weeklyHours, 6.17);
});

test('panel hari ini berisi sesi Senin saat hari Senin', () => {
  const d = buildDashboard({ sessions: [s(1, 'SENIN', 0, '08:00', '09:00'), s(2, 'SELASA', 1, '08:00', '09:00')], tasks: [], now: NOW });
  assert.equal(d.today.dayName, 'Senin');
  assert.deepEqual(d.today.sessions.map((x) => x.course), ['SENIN']);
});

test('findNextSession: yang berikutnya hari ini setelah jam sekarang', () => {
  const list = [s(1, 'PAGI', 0, '08:00', '09:00'), s(2, 'SIANG', 0, '13:00', '15:00')];
  assert.deepEqual(findNextSession(list, NOW), { session: list[1], daysAhead: 0 });
});

test('findNextSession: jika hari ini selesai, ambil hari berikutnya; jika hanya Senin lewat, Senin depan', () => {
  assert.equal(findNextSession([s(1, 'PAGI', 0, '08:00', '09:00'), s(2, 'RABU', 2, '08:00', '09:40')], NOW).daysAhead, 2);
  assert.equal(findNextSession([s(1, 'PAGI', 0, '08:00', '09:00')], NOW).daysAhead, 7);
});
