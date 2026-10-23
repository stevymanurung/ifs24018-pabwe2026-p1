import { useCallback, useEffect, useMemo, useState } from 'react';

const INITIAL_STATE = { items: [], status: 'loading', error: null };

/**
 * Mengelola satu koleksi dari API: memuat daftar, lalu memuat ulang setelah setiap perubahan
 * sehingga urutan dan validasi tetap ditentukan server (sumber kebenaran tunggal).
 * Aksi create/update/remove melempar ApiError agar formulir dapat menampilkan pesannya.
 */
export function useCollection(api) {
  const [state, setState] = useState(INITIAL_STATE);

  const load = useCallback(
    async (signal) => {
      try {
        const items = await api.list(signal);
        setState({ items, status: 'ready', error: null });
      } catch (error) {
        if (error.name === 'AbortError') return;
        setState((previous) => ({ ...previous, status: 'error', error }));
      }
    },
    [api],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return useMemo(() => {
    const mutate = async (operation) => {
      const result = await operation();
      await load();
      return result;
    };
    return {
      ...state,
      reload: () => load(),
      create: (input) => mutate(() => api.create(input)),
      update: (id, patch) => mutate(() => api.update(id, patch)),
      remove: (id) => mutate(() => api.remove(id)),
    };
  }, [api, load, state]);
}
