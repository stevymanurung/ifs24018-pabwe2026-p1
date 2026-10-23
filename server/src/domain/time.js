/** Fungsi waktu murni: tanpa akses database maupun HTTP, sehingga mudah diuji. */
export const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_NOW_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/;

const pad = (n) => String(n).padStart(2, '0');

/** "9:05" -> 545. Mengembalikan NaN jika format tidak valid. */
export function toMinutes(text) {
  const match = TIME_PATTERN.exec(String(text ?? '').trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN;
}

/** "9:05" -> "09:05" (bentuk baku yang disimpan di database). */
export function normalizeTime(text) {
  const minutes = toMinutes(text);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Indeks hari dengan Senin = 0 ... Minggu = 6 (Date.getDay() memakai Minggu = 0). */
export const dayIndex = (date) => (date.getDay() + 6) % 7;

/** Tanggal lokal YYYY-MM-DD, bukan UTC. */
export const toDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function isValidDateString(text) {
  if (!DATE_PATTERN.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** "2026-10-19T08:00" (waktu lokal pengguna) -> Date. Mengembalikan null jika tidak valid. */
export function parseLocalNow(text) {
  const match = LOCAL_NOW_PATTERN.exec(String(text ?? ''));
  if (!match) return null;
  const [y, m, d, hh, mm] = match.slice(1).map(Number);
  const date = new Date(y, m - 1, d, hh, mm);
  return date.getMonth() === m - 1 ? date : null;
}
