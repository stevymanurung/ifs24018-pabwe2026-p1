import { openDatabase } from '../../src/db/connection.js';


const silentLogger = { error() {}, log() {} };

/** Menjalankan aplikasi pada port acak dengan SQLite in-memory. APP_MODULE memungkinkan menguji implementasi lain (draf awal AI). */
export async function startTestServer() {
  const modulePath = process.env.APP_MODULE || new URL('../../src/app.js', import.meta.url).href;
  const { createApp } = await import(modulePath);
  const db = openDatabase(':memory:');
  const app = createApp({ db, logger: silentLogger, clientDist: '' });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  /** `rawBody` mengirim string apa adanya (untuk menguji JSON rusak). */
  async function request(method, path, body, { rawBody } = {}) {
    const hasBody = body !== undefined || rawBody !== undefined;
    const response = await fetch(base + path, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : {},
      body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* bukan JSON */ }
    return { status: response.status, json, text, headers: response.headers };
  }

  return {
    request,
    base,
    close: () => new Promise((resolve) => server.close(() => { db.close(); resolve(); })),
  };
}

import test from 'node:test';

/** Setiap tes mendapat server dan database baru sehingga tidak saling memengaruhi. */
export const apiTest = (name, fn) =>
  test(name, async () => {
    const api = await startTestServer();
    try { await fn(api); } finally { await api.close(); }
  });

export const session = (course, day, start, end, room = '') => ({ course, day, start, end, room });
export const NOW = '2026-10-19T10:00'; // Senin, 19 Oktober 2026 10:00
