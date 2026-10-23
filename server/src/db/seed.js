import { pathToFileURL } from 'node:url';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { openDatabase } from './connection.js';

const SESSIONS = [
  ['Pengembangan Aplikasi Web', 0, '08:00', '10:00', 'GD 513'],
  ['Basis Data', 0, '10:00', '12:00', 'GD 514'],
  ['Jaringan Komputer', 1, '13:00', '15:00', 'Lab 2'],
  ['Struktur Data', 2, '08:00', '09:40', 'GD 511'],
  ['Pemrograman Web', 3, '13:00', '15:00', 'Lab 1'],
  ['Praktikum Basis Data', 4, '08:00', '10:30', 'Lab 3'],
];

const offsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Mengisi data contoh hanya jika database masih kosong. Mengembalikan true jika data dimasukkan. */
export function seedDemoData(db) {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM sessions').get();
  const { total: taskTotal } = db.prepare('SELECT COUNT(*) AS total FROM tasks').get();
  if (total > 0 || taskTotal > 0) return false;

  const insertSession = db.prepare('INSERT INTO sessions (course, day, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)');
  const insertTask = db.prepare('INSERT INTO tasks (title, course, due_date, remind_at, done) VALUES (?, ?, ?, ?, ?)');
  const insertAlarm = db.prepare('INSERT INTO alarms (label, time, days, enabled) VALUES (?, ?, ?, 1)');

  db.transaction(() => {
    SESSIONS.forEach((row) => insertSession.run(...row));
    insertTask.run('Kumpulkan Proyek 1 PABWE', 'Pengembangan Aplikasi Web', offsetDate(2), '09:00', 0);
    insertTask.run('Laporan praktikum jaringan', 'Jaringan Komputer', offsetDate(-2), '', 0);
    insertTask.run('Latihan soal normalisasi', 'Basis Data', offsetDate(0), '', 0);
    insertTask.run('Kuis struktur data', 'Struktur Data', offsetDate(3), '', 0);
    insertTask.run('Resume bab 5', 'Basis Data', offsetDate(-5), '', 1);
    insertTask.run('Slide presentasi PAW', 'Pengembangan Aplikasi Web', offsetDate(-4), '', 1);
    insertTask.run('Belajar Svelte untuk modul 6', '', '', '', 0);
    insertAlarm.run('Belajar mandiri', '19:30', '0,1,2,3,4');
  })();
  return true;
}

// Dijalankan langsung: `npm run seed`
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = openDatabase(config.dbFile);
  logger.info(seedDemoData(db) ? 'Data contoh dimasukkan.' : 'Database sudah berisi data; seed dilewati.');
  db.close();
}
