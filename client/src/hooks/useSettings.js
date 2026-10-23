import { useEffect, useMemo, useState } from 'react';
import { settingsApi } from '../services/settingsApi.js';

const DEFAULT_SETTINGS = { reminderLead: 10 };

/** Pengaturan aplikasi (menit pengingat sebelum kuliah). */
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const controller = new AbortController();
    settingsApi
      .get(controller.signal)
      .then(setSettings)
      .catch(() => {}); // gagal memuat: pakai nilai bawaan, tidak mengganggu fitur lain
    return () => controller.abort();
  }, []);

  return useMemo(
    () => ({ ...settings, updateReminderLead: async (reminderLead) => setSettings(await settingsApi.update({ reminderLead })) }),
    [settings],
  );
}
