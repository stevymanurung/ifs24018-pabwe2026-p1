import { describe, expect, it } from 'vitest';
import { GRACE_MS, computeTriggers, dueReminders, makeSnooze, pruneFired, splitSnoozes } from './engine.js';

// Senin, 19 Oktober 2026 (indeks hari 0). Argumen: jam, menit, detik, geser hari.
const at = (hour, minute, second = 0, dayOffset = 0) => new Date(2026, 9, 19 + dayOffset, hour, minute, second);
const state = (overrides) => ({ alarms: [], sessions: [], tasks: [], lead: 0, ...overrides });
const alarm = (overrides) => ({ id: 1, label: 'Belajar', time: '08:00', days: [0], enabled: true, ...overrides });
const kuliah = { id: 7, course: 'Basis Data', day: 0, start: '08:00', end: '10:00', room: 'GD 514' };

describe('alarm kustom', () => {
  const s = state({ alarms: [alarm()] });

  it('berbunyi pada menitnya di hari yang dipilih saja', () => {
    expect(dueReminders(s, at(8, 0, 5), {})).toHaveLength(1);
    expect(dueReminders(s, at(8, 0, 5, 1), {})).toHaveLength(0); // Selasa
  });

  it('belum berbunyi sebelum waktunya', () => {
    expect(dueReminders(s, at(7, 59, 59), {})).toHaveLength(0);
  });

  it('tetap berbunyi jika pengecekan terlambat, tetapi tidak setelah toleransi 2 menit', () => {
    expect(dueReminders(s, at(8, 1, 30), {})).toHaveLength(1);
    expect(dueReminders(s, at(8, 2, 30), {})).toHaveLength(0);
    expect(GRACE_MS).toBe(120_000);
  });

  it('tidak berbunyi dua kali pada hari yang sama', () => {
    const [first] = dueReminders(s, at(8, 0, 5), {});
    expect(dueReminders(s, at(8, 0, 20), { [first.key]: at(8, 0, 5).getTime() })).toHaveLength(0);
  });

  it('catatan kemarin tidak menghalangi alarm hari ini', () => {
    const repeating = state({ alarms: [alarm({ days: [0, 1] })] });
    const [monday] = dueReminders(repeating, at(8, 0, 5), {});
    expect(dueReminders(repeating, at(8, 0, 5, 1), { [monday.key]: 1 })).toHaveLength(1);
  });

  it('alarm yang dimatikan tidak berbunyi', () => {
    expect(dueReminders(state({ alarms: [alarm({ enabled: false })] }), at(8, 0, 5), {})).toHaveLength(0);
  });

  it('Minggu dipetakan ke indeks 6, bukan Senin', () => {
    const sunday = state({ alarms: [alarm({ days: [6] })] });
    expect(dueReminders(sunday, at(8, 0, 5, 6), {})).toHaveLength(1);
    expect(dueReminders(sunday, at(8, 0, 5, 0), {})).toHaveLength(0);
  });
});

describe('pengingat kuliah', () => {
  it('muncul tepat N menit sebelum mulai', () => {
    const s = state({ sessions: [kuliah], lead: 10 });
    expect(dueReminders(s, at(7, 49, 59), {})).toHaveLength(0);
    const [due] = dueReminders(s, at(7, 50, 5), {});
    expect(due.text).toContain('Basis Data');
    expect(due.text).toContain('GD 514');
  });

  it('mati jika lead = 0 dan tidak muncul di hari lain', () => {
    expect(dueReminders(state({ sessions: [kuliah], lead: 0 }), at(7, 50, 5), {})).toHaveLength(0);
    expect(dueReminders(state({ sessions: [kuliah], lead: 10 }), at(7, 50, 5, 1), {})).toHaveLength(0);
  });

  it('kuliah Selasa 00:10 dengan lead 30 mengingatkan Senin 23:40', () => {
    const malam = { id: 1, course: 'Kelas Malam', day: 1, start: '00:10', end: '01:00', room: '' };
    expect(dueReminders(state({ sessions: [malam], lead: 30 }), at(23, 40, 5), {})).toHaveLength(1);
  });

  it('mengganti lead menghasilkan kunci baru sehingga tidak tertahan catatan lama', () => {
    const [ten] = computeTriggers(state({ sessions: [kuliah], lead: 10 }), at(7, 0));
    const [thirty] = computeTriggers(state({ sessions: [kuliah], lead: 30 }), at(7, 0));
    expect(ten.key).not.toBe(thirty.key);
  });
});

describe('pengingat tugas', () => {
  const task = { id: 3, title: 'Laporan', course: 'Basis Data', dueDate: '2026-10-19', done: false, remindAt: '09:00' };

  it('berbunyi pada tanggal tenggat dan jam yang dipilih', () => {
    expect(dueReminders(state({ tasks: [task] }), at(9, 0, 5), {})).toHaveLength(1);
    expect(dueReminders(state({ tasks: [task] }), at(9, 0, 5, 1), {})).toHaveLength(0);
  });

  it('tugas selesai atau tanpa jam pengingat tidak berbunyi', () => {
    const tasks = [{ ...task, done: true }, { ...task, id: 4, remindAt: '' }];
    expect(dueReminders(state({ tasks }), at(9, 0, 5), {})).toHaveLength(0);
  });
});

describe('tunda dan pembersihan', () => {
  it('tunda 5 menit jatuh tempo tepat pada waktunya (batas inklusif)', () => {
    const snooze = makeSnooze({ key: 'k', title: 'T', text: 'x' }, at(8, 0, 0), 5);
    expect(splitSnoozes([snooze], at(8, 4, 59).getTime()).due).toHaveLength(0);
    const exact = splitSnoozes([snooze], at(8, 5, 0).getTime());
    expect(exact.due).toHaveLength(1);
    expect(exact.pending).toHaveLength(0);
  });

  it('pruneFired membuang catatan yang lebih tua dari 2 hari', () => {
    const now = at(8, 0).getTime();
    const kept = pruneFired({ lama: now - 5 * 86_400_000, baru: now - 3_600_000 }, now);
    expect(Object.keys(kept)).toEqual(['baru']);
  });
});
