import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dueReminders, makeSnooze, pruneFired, splitSnoozes } from './engine.js';
import { loadReminderState, saveReminderState } from './firedStore.js';
import { readNotificationPermission, requestNotificationPermission, showNotification } from './notifications.js';
import { createAlarmSound } from './sound.js';

const CHECK_INTERVAL_MS = 15_000;
const SNOOZE_MINUTES = 5;
const TEST_KEY_PREFIX = 'test:';

/**
 * Menjalankan pengingat: memeriksa pemicu secara berkala, menampilkan dialog, membunyikan alarm,
 * dan mengirim notifikasi. Logika waktunya ada di engine.js; hook ini hanya menghubungkannya ke browser.
 */
export function useReminderEngine({ alarms, sessions, tasks, lead }) {
  const [ringing, setRinging] = useState([]);
  const [soundReady, setSoundReady] = useState(false);
  const [permission, setPermission] = useState(readNotificationPermission);
  const [sound] = useState(createAlarmSound);

  const latestData = useRef({ alarms, sessions, tasks, lead });
  const store = useRef(null);
  if (store.current === null) store.current = loadReminderState();

  useEffect(() => {
    latestData.current = { alarms, sessions, tasks, lead };
  }, [alarms, sessions, tasks, lead]);

  const fire = useCallback((reminders) => {
    if (reminders.length === 0) return;
    reminders.forEach(showNotification);
    setRinging((current) => [...current, ...reminders.filter((item) => !current.some((existing) => existing.key === item.key))]);
  }, []);

  const check = useCallback(() => {
    const now = new Date();
    const nowMs = now.getTime();
    const due = dueReminders(latestData.current, now, store.current.fired);
    const { due: wakeUps, pending } = splitSnoozes(store.current.snoozes, nowMs);
    if (due.length === 0 && wakeUps.length === 0) return;

    const firedNow = Object.fromEntries(due.map((reminder) => [reminder.key, nowMs]));
    store.current = { fired: pruneFired({ ...store.current.fired, ...firedNow }, nowMs), snoozes: pending };
    saveReminderState(store.current);
    fire([...due, ...wakeUps]);
  }, [fire]);

  useEffect(() => {
    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    const checkWhenVisible = () => {
      if (!document.hidden) check();
    };
    document.addEventListener('visibilitychange', checkWhenVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', checkWhenVisible);
    };
  }, [check]);

  const isRinging = ringing.length > 0;
  useEffect(() => {
    if (!isRinging) return undefined;
    sound.start();
    return () => sound.stop();
  }, [isRinging, sound]);

  // Setelah reload, interaksi pertama di halaman otomatis mengaktifkan suara agar alarm tidak berbunyi hening.
  useEffect(() => {
    const unlockOnInteraction = () => setSoundReady(sound.unlock());
    window.addEventListener('pointerdown', unlockOnInteraction, { once: true });
    window.addEventListener('keydown', unlockOnInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnInteraction);
      window.removeEventListener('keydown', unlockOnInteraction);
    };
  }, [sound]);

  const dismiss = useCallback(() => setRinging([]), []);

  const snooze = useCallback(() => {
    const now = new Date();
    const snoozed = ringing.filter((item) => !item.key.startsWith(TEST_KEY_PREFIX)).map((item) => makeSnooze(item, now, SNOOZE_MINUTES));
    store.current = { ...store.current, snoozes: [...store.current.snoozes, ...snoozed] };
    saveReminderState(store.current);
    setRinging([]);
  }, [ringing]);

  const controls = useMemo(
    () => ({
      soundReady,
      permission,
      enable: async () => {
        setSoundReady(sound.unlock());
        setPermission(await requestNotificationPermission());
      },
      testRing: () => {
        setSoundReady(sound.unlock());
        fire([{ key: `${TEST_KEY_PREFIX}${Date.now()}`, title: 'Tes pengingat', text: 'Jika Anda mendengar bunyi, alarm siap dipakai.' }]);
      },
    }),
    [soundReady, permission, sound, fire],
  );

  return { ringing, dismiss, snooze, controls };
}
