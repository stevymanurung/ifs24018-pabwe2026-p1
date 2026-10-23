import test from 'node:test';
import assert from 'node:assert/strict';
import { dayIndex, isValidDateString, normalizeTime, parseLocalNow, toDateString, toMinutes } from '../../src/domain/time.js';

test('toMinutes menerima jam dengan atau tanpa nol di depan', () => {
  assert.equal(toMinutes('09:05'), 545);
  assert.equal(toMinutes('9:05'), 545);
  assert.equal(toMinutes('23:59'), 1439);
});

test('toMinutes menolak format tidak valid', () => {
  for (const bad of ['abc', '25:00', '12:60', '', null, undefined, '9']) assert.ok(Number.isNaN(toMinutes(bad)), String(bad));
});

test('normalizeTime menghasilkan bentuk baku HH:MM', () => {
  assert.equal(normalizeTime('9:05'), '09:05');
});

test('dayIndex: Senin = 0 dan Minggu = 6', () => {
  assert.equal(dayIndex(new Date(2026, 9, 19)), 0);
  assert.equal(dayIndex(new Date(2026, 9, 25)), 6);
});

test('toDateString memakai tanggal lokal', () => {
  assert.equal(toDateString(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('isValidDateString menolak tanggal yang tidak ada', () => {
  assert.equal(isValidDateString('2026-10-19'), true);
  assert.equal(isValidDateString('2026-02-30'), false);
  assert.equal(isValidDateString('19-10-2026'), false);
});

test('parseLocalNow mengurai waktu lokal dan menolak format lain', () => {
  const date = parseLocalNow('2026-10-19T08:30');
  assert.equal(date.getHours(), 8);
  assert.equal(date.getMinutes(), 30);
  assert.equal(parseLocalNow('2026-10-19'), null);
  assert.equal(parseLocalNow('2026-13-19T08:30'), null);
});
