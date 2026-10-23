import { useCallback, useState } from 'react';

/**
 * Membungkus aksi asinkron milik formulir: melacak status `pending` dan pesan error.
 * `submit` mengembalikan true jika berhasil sehingga formulir tahu kapan perlu direset.
 */
export function useSubmit(action) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(
    async (...args) => {
      setPending(true);
      setError('');
      try {
        await action(...args);
        return true;
      } catch (caught) {
        setError(caught.message);
        return false;
      } finally {
        setPending(false);
      }
    },
    [action],
  );

  return { submit, pending, error };
}
