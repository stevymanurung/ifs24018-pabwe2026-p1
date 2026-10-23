import { describe, expect, it, vi } from 'vitest';
import { ApiError, createHttpClient } from './httpClient.js';

const jsonResponse = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

describe('createHttpClient', () => {
  it('mengirim JSON dan mengembalikan isi respons', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(201, { id: 1 }));
    const http = createHttpClient({ baseUrl: '/api', fetchImpl });

    await expect(http.post('/tasks', { title: 'A' })).resolves.toEqual({ id: 1 });
    expect(fetchImpl).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'A' }),
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('respons 204 mengembalikan null', async () => {
    const http = createHttpClient({ baseUrl: '/api', fetchImpl: async () => ({ status: 204, ok: true }) });
    await expect(http.delete('/tasks/1')).resolves.toBeNull();
  });

  it('error server diubah menjadi ApiError dengan pesan dari server', async () => {
    const body = { error: { code: 'SESSION_CONFLICT', message: 'Bentrok dengan "Basis Data"' } };
    const http = createHttpClient({ baseUrl: '/api', fetchImpl: async () => jsonResponse(409, body) });

    await expect(http.post('/sessions', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'SESSION_CONFLICT',
      message: 'Bentrok dengan "Basis Data"',
    });
  });

  it('respons error tanpa JSON tetap menghasilkan pesan yang jelas', async () => {
    const response = { status: 502, ok: false, json: async () => { throw new Error('bukan json'); } };
    const http = createHttpClient({ baseUrl: '/api', fetchImpl: async () => response });
    await expect(http.get('/tasks')).rejects.toMatchObject({ code: 'HTTP_ERROR', message: 'Permintaan gagal (502)' });
  });

  it('kegagalan jaringan menjadi ApiError berbahasa Indonesia', async () => {
    const http = createHttpClient({ baseUrl: '/api', fetchImpl: async () => { throw new TypeError('fetch failed'); } });
    const error = await http.get('/tasks').catch((caught) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toMatch(/Tidak dapat terhubung/);
  });

  it('pembatalan (AbortError) diteruskan apa adanya, bukan dianggap error jaringan', async () => {
    const abort = Object.assign(new Error('dibatalkan'), { name: 'AbortError' });
    const http = createHttpClient({ baseUrl: '/api', fetchImpl: async () => { throw abort; } });
    await expect(http.get('/tasks')).rejects.toBe(abort);
  });
});
