const STORAGE_KEY = 'study-planner:reminder-state';
const EMPTY_STATE = { fired: {}, snoozes: [] };

const isSnooze = (value) => value && typeof value.at === 'number' && typeof value.text === 'string' && typeof value.key === 'string';

/**
 * Status pengingat per perangkat (bukan data pengguna di server): kunci yang sudah berbunyi dan tunda aktif.
 * Data rusak atau penyimpanan yang tidak tersedia tidak boleh membuat aplikasi gagal, jadi hasilnya diganti nilai kosong.
 */
export function loadReminderState(storage) {
  try {
    // Akses localStorage di dalam try karena browser tertentu dapat melempar SecurityError.
    const targetStorage = storage ?? globalThis.localStorage;
    const parsed = JSON.parse(targetStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_STATE };
    const fired = parsed.fired && typeof parsed.fired === 'object' && !Array.isArray(parsed.fired) ? parsed.fired : {};
    const snoozes = Array.isArray(parsed.snoozes) ? parsed.snoozes.filter(isSnooze) : [];
    return { fired, snoozes };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveReminderState(state, storage) {
  try {
    // Getter localStorage sendiri dapat gagal pada konteks browser yang membatasi penyimpanan.
    const targetStorage = storage ?? globalThis.localStorage;
    targetStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Penyimpanan penuh atau diblokir: pengingat tetap berjalan, hanya tidak bertahan setelah reload.
  }
}
