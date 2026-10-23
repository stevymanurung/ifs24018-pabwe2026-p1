/** Error API: membawa status HTTP, kode mesin, dan pesan yang aman ditampilkan kepada pengguna. */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const NETWORK_MESSAGE = 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.';

/**
 * Membuat klien HTTP JSON. `fetchImpl` dapat diganti saat pengujian.
 * Kegagalan jaringan dan respons error server diseragamkan menjadi ApiError.
 */
export function createHttpClient({ baseUrl, fetchImpl = (...args) => fetch(...args) }) {
  async function request(path, { method = 'GET', body, signal } = {}) {
    let response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(globalThis.localStorage?.getItem('study-planner-token') ? { Authorization: `Bearer ${globalThis.localStorage.getItem('study-planner-token')}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (cause) {
      if (cause?.name === 'AbortError') throw cause;
      throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE);
    }

    if (response.status === 204) return null;
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = payload?.error;
      throw new ApiError(response.status, error?.code ?? 'HTTP_ERROR', error?.message ?? `Permintaan gagal (${response.status})`, error?.details);
    }
    return payload;
  }

  return {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body) => request(path, { method: 'POST', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
  };
}

export const http = createHttpClient({ baseUrl: import.meta.env?.VITE_API_BASE ?? '/api' });
