/** Fungsi tanggal dan waktu murni (tanpa React). Indeks hari: Senin = 0 ... Minggu = 6. */
export const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const DAY_SHORT_NAMES = DAY_NAMES.map((name) => name.slice(0, 3));

const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

const pad2 = (value) => String(value).padStart(2, '0');

/** "9:05" -> 545. Mengembalikan NaN jika format tidak valid. */
export function toMinutes(text) {
  const match = TIME_PATTERN.exec(String(text ?? '').trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN;
}

/** Date.getDay() memakai Minggu = 0; aplikasi ini memakai Senin = 0. */
export const dayIndex = (date) => (date.getDay() + 6) % 7;

/** Tanggal lokal YYYY-MM-DD (bukan UTC). */
export const toDateString = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** Waktu lokal YYYY-MM-DDTHH:mm, dikirim ke API agar server memakai hari yang sama dengan pengguna. */
export const toLocalNowString = (date = new Date()) => `${toDateString(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

/** Contoh: "Senin, 19 Okt 2026". */
export const formatLongDate = (date) =>
  `${DAY_NAMES[dayIndex(date)]}, ${date.getDate()} ${MONTH_SHORT_NAMES[date.getMonth()]} ${date.getFullYear()}`;

/** Menerjemahkan hasil `nextSession` dari API menjadi teks untuk widget sidebar. */
export function describeNextSession(next) {
  if (!next) return { course: '-', when: 'Belum ada jadwal' };
  const { session, daysAhead } = next;
  const dayLabel = daysAhead === 0 ? 'Hari ini' : daysAhead === 1 ? 'Besok' : DAY_NAMES[session.day];
  const room = session.room ? ` (${session.room})` : '';
  return { course: session.course, when: `${dayLabel}, ${session.start} - ${session.end}${room}` };
}
