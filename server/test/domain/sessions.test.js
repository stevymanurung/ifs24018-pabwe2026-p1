import test from 'node:test';
import assert from 'node:assert/strict';
import { findConflict, overlaps, sessionMinutes, sortSessions } from '../../src/domain/sessions.js';

const s = (day, start, end, course = 'X') => ({ course, day, start, end });

test('sesi berurutan (selesai 09:00, mulai 09:00) tidak bentrok', () => {
  assert.equal(overlaps(s(0, '08:00', '09:00'), s(0, '09:00', '10:00')), false);
});

test('sesi yang saling menyilang bentrok', () => {
  assert.equal(overlaps(s(0, '08:00', '10:00'), s(0, '09:00', '11:00')), true);
  assert.equal(overlaps(s(0, '08:00', '12:00'), s(0, '09:00', '10:00')), true);
});

test('hari berbeda tidak bentrok', () => {
  assert.equal(overlaps(s(0, '08:00', '10:00'), s(1, '08:00', '10:00')), false);
});

test('findConflict mengembalikan sesi yang bentrok atau null', () => {
  const list = [s(0, '08:00', '10:00', 'A')];
  assert.equal(findConflict(list, s(0, '09:00', '11:00')).course, 'A');
  assert.equal(findConflict(list, s(0, '10:00', '11:00')), null);
});

test('sortSessions mengurutkan hari lalu jam mulai (jam diperlakukan sebagai angka)', () => {
  const sorted = sortSessions([s(1, '08:00', '09:00', 'C'), s(0, '13:00', '14:00', 'B'), s(0, '9:00', '10:00', 'A')]);
  assert.deepEqual(sorted.map((x) => x.course), ['A', 'B', 'C']);
});

test('sessionMinutes menghitung jam dan menit', () => {
  assert.equal(sessionMinutes(s(2, '08:00', '09:40')), 100);
  assert.equal(sessionMinutes(s(2, '10:00', '09:00')), 0);
});
