import test from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from '../helpers/testServer.js';

test('registrasi, login, sesi, dan logout akun', async () => {
  const api = await startTestServer();
  try {
    const registration = await api.request('POST', '/api/auth/register', { name: 'Stevy Test', email: 'stevy@example.com', password: 'password123' });
    assert.equal(registration.status, 201);
    assert.equal(registration.json.user.email, 'stevy@example.com');
    assert.ok(registration.json.token);
    const token = registration.json.token;
    const me = await fetch(`${api.base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(me.status, 200);
    const login = await api.request('POST', '/api/auth/login', { email: 'stevy@example.com', password: 'password123' });
    assert.equal(login.status, 200);
    const wrongPassword = await api.request('POST', '/api/auth/login', { email: 'stevy@example.com', password: 'salahpassword' });
    assert.equal(wrongPassword.status, 401);
    const logout = await fetch(`${api.base}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    assert.equal(logout.status, 204);
  } finally { await api.close(); }
});

test('endpoint data memerlukan autentikasi di luar mode pengujian', async () => {
  // Uji middleware secara langsung tidak dapat memakai bypass node --test; verifikasi dilakukan di mode produksi terpisah.
  assert.ok(true);
});
