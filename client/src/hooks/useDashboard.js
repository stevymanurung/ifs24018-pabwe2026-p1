import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/dashboardApi.js';
import { toLocalNowString } from '../lib/time.js';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * Data dashboard dari server. Dimuat ulang ketika daftar sesi/tugas berubah dan setiap menit
 * (supaya "Kuliah berikutnya" ikut maju tanpa memuat ulang halaman).
 */
export function useDashboard(sessionItems, taskItems) {
  const [state, setState] = useState({ data: null, status: 'loading', error: null });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        const data = await dashboardApi.get(toLocalNowString(), controller.signal);
        setState({ data, status: 'ready', error: null });
      } catch (error) {
        if (error.name === 'AbortError') return;
        setState((previous) => ({ ...previous, status: 'error', error }));
      }
    }

    fetchDashboard();
    const timer = setInterval(fetchDashboard, REFRESH_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [sessionItems, taskItems]);

  return state;
}
