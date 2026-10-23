const STORAGE_KEY = 'study-planner:reminder-state';
const EMPTY_STATE = { fired: {}, snoozes: [] };

const isSnooze = (value) => value && typeof value.at === 'number' && typeof value.text === 'string' && typeof value.key === 'string';

/**
 * Status pengingat per perangkat (bukan data pengguna di server): kunci yang sudah berbunyi dan tunda aktif.
 * Data rusak atau penyimpanan yang tidak tersedia tidak boleh membuat aplikasi gagal, jadi hasilnya diganti nilai kosong.
 */
export function loadReminderState(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_STATE };
    const fired = parsed.fired && typeof parsed.fired === 'object' && !Array.isArray(parsed.fired) ? parsed.fired : {};
    const snoozes = Array.isArray(parsed.snoozes) ? parsed.snoozes.filter(isSnooze) : [];
    return { fired, snoozes };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveReminderState(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Penyimpanan penuh atau diblokir: pengingat tetap berjalan, hanya tidak bertahan setelah reload.
  }
}
