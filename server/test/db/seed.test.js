import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../../src/db/connection.js';
import { seedDemoData } from '../../src/db/seed.js';

const count = (db, table) => db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total;

test('seedDemoData mengisi database kosong dengan sesi, tugas, dan alarm', () => {
  const db = openDatabase(':memory:');
  assert.equal(seedDemoData(db), true);
  assert.equal(count(db, 'sessions'), 6);
  assert.equal(count(db, 'tasks'), 7);
  assert.equal(count(db, 'alarms'), 1);
  db.close();
});

test('seedDemoData tidak menimpa data yang sudah ada (idempoten)', () => {
  const db = openDatabase(':memory:');
  seedDemoData(db);
  assert.equal(seedDemoData(db), false);
  assert.equal(count(db, 'sessions'), 6);
  db.close();
});

test('skema menolak nilai di luar batas (CHECK constraint)', () => {
  const db = openDatabase(':memory:');
  assert.throws(() => db.prepare("INSERT INTO sessions (course, day, start_time, end_time) VALUES ('A', 9, '08:00', '09:00')").run());
  db.close();
});
