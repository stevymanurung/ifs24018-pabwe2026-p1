import { describe, expect, it } from 'vitest';
import { dayIndex, describeNextSession, formatLongDate, toDateString, toLocalNowString, toMinutes } from './time.js';

describe('toMinutes', () => {
  it('menerima jam dengan atau tanpa nol di depan', () => {
    expect(toMinutes('09:05')).toBe(545);
    expect(toMinutes('9:05')).toBe(545);
  });

  it.each(['abc', '25:00', '12:60', '', null, undefined])('menolak %j', (input) => {
    expect(toMinutes(input)).toBeNaN();
  });
});

describe('tanggal', () => {
  it('dayIndex: Senin = 0 dan Minggu = 6', () => {
    expect(dayIndex(new Date(2026, 9, 19))).toBe(0);
    expect(dayIndex(new Date(2026, 9, 25))).toBe(6);
  });

  it('toDateString dan toLocalNowString memakai waktu lokal', () => {
    const date = new Date(2026, 0, 5, 7, 3);
    expect(toDateString(date)).toBe('2026-01-05');
    expect(toLocalNowString(date)).toBe('2026-01-05T07:03');
  });

  it('formatLongDate menghasilkan hari dan bulan Indonesia', () => {
    expect(formatLongDate(new Date(2026, 9, 19))).toBe('Senin, 19 Okt 2026');
  });
});

describe('describeNextSession', () => {
  const session = { course: 'Basis Data', day: 2, start: '10:00', end: '12:00', room: 'GD 514' };

  it('menampilkan label hari yang ramah', () => {
    expect(describeNextSession({ session, daysAhead: 0 }).when).toBe('Hari ini, 10:00 - 12:00 (GD 514)');
    expect(describeNextSession({ session, daysAhead: 1 }).when).toContain('Besok');
    expect(describeNextSession({ session, daysAhead: 3 }).when).toContain('Rabu');
  });

  it('menangani tidak ada jadwal', () => {
    expect(describeNextSession(null)).toEqual({ course: '-', when: 'Belum ada jadwal' });
  });
});
