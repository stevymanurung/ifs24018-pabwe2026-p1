const BEEP_INTERVAL_MS = 900;
const MAX_RING_MS = 60_000;
const BEEP_OFFSETS_S = [0, 0.22];

/**
 * Bunyi alarm dengan Web Audio API (tanpa berkas audio). Browser baru mengizinkan suara setelah
 * ada interaksi pengguna, sehingga `unlock()` harus dipanggil dari event klik atau tombol.
 */
export function createAlarmSound() {
  let context = null;
  let beepTimer = null;
  let stopTimer = null;

  function unlock() {
    try {
      const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContextClass) return false;
      context ??= new AudioContextClass();
      if (context.state === 'suspended') context.resume();
      return true;
    } catch {
      return false;
    }
  }

  function beep() {
    if (!context) return;
    const start = context.currentTime;
    BEEP_OFFSETS_S.forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + 0.2);
    });
  }

  function stop() {
    clearInterval(beepTimer);
    clearTimeout(stopTimer);
    beepTimer = null;
    stopTimer = null;
  }

  function start() {
    if (beepTimer) return;
    beep();
    beepTimer = setInterval(beep, BEEP_INTERVAL_MS);
    stopTimer = setTimeout(stop, MAX_RING_MS); // berhenti sendiri agar tidak berbunyi tanpa akhir
  }

  return { unlock, start, stop, isUnlocked: () => context !== null };
}
