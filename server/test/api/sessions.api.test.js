import assert from 'node:assert/strict';
import { apiTest, session } from '../helpers/testServer.js';

apiTest('POST /api/sessions membuat sesi valid (201) dan menormalkan jam', async ({ request }) => {
  const res = await request('POST', '/api/sessions', session('Pemrograman Web', 0, '9:00', '10:30', 'GD 513'));
  assert.equal(res.status, 201);
  assert.deepEqual({ ...res.json, id: undefined }, { id: undefined, course: 'Pemrograman Web', day: 0, start: '09:00', end: '10:30', room: 'GD 513' });
});

apiTest('POST /api/sessions menolak nama kosong atau hanya spasi (400)', async ({ request }) => {
  const res = await request('POST', '/api/sessions', session('   ', 0, '08:00', '09:00'));
  assert.equal(res.status, 400);
  assert.equal(res.json.error.code, 'VALIDATION_ERROR');
  assert.match(res.json.error.message, /tidak boleh kosong/);
});

apiTest('POST /api/sessions menolak jam selesai sebelum atau sama dengan jam mulai', async ({ request }) => {
  assert.equal((await request('POST', '/api/sessions', session('A', 0, '10:00', '09:00'))).status, 400);
  assert.equal((await request('POST', '/api/sessions', session('A', 0, '10:00', '10:00'))).status, 400);
});

apiTest('POST /api/sessions menerima jam tanpa nol di depan (9:00 - 10:00)', async ({ request }) => {
  assert.equal((await request('POST', '/api/sessions', session('A', 0, '9:00', '10:00'))).status, 201);
});

apiTest('POST /api/sessions menolak format jam dan hari yang tidak valid', async ({ request }) => {
  assert.equal((await request('POST', '/api/sessions', session('A', 0, '08:00', 'abc'))).status, 400);
  assert.equal((await request('POST', '/api/sessions', session('A', 0, '25:00', '26:00'))).status, 400);
  assert.equal((await request('POST', '/api/sessions', session('A', 9, '08:00', '09:00'))).status, 400);
  assert.equal((await request('POST', '/api/sessions', { course: 'A' })).status, 400);
});

apiTest('sesi berurutan tidak dianggap bentrok', async ({ request }) => {
  await request('POST', '/api/sessions', session('A', 0, '08:00', '09:00'));
  assert.equal((await request('POST', '/api/sessions', session('B', 0, '09:00', '10:00'))).status, 201);
});

apiTest('sesi yang menyilang ditolak dengan 409 dan pesan jelas', async ({ request }) => {
  await request('POST', '/api/sessions', session('Basis Data', 0, '08:00', '10:00'));
  const res = await request('POST', '/api/sessions', session('B', 0, '09:00', '11:00'));
  assert.equal(res.status, 409);
  assert.equal(res.json.error.code, 'SESSION_CONFLICT');
  assert.match(res.json.error.message, /Basis Data/);
});

apiTest('jam yang sama pada hari berbeda diperbolehkan', async ({ request }) => {
  await request('POST', '/api/sessions', session('A', 0, '08:00', '10:00'));
  assert.equal((await request('POST', '/api/sessions', session('B', 1, '08:00', '10:00'))).status, 201);
});

apiTest('GET /api/sessions terurut menurut hari lalu jam mulai', async ({ request }) => {
  await request('POST', '/api/sessions', session('C', 1, '08:00', '09:00'));
  await request('POST', '/api/sessions', session('B', 0, '13:00', '14:00'));
  await request('POST', '/api/sessions', session('A', 0, '9:00', '10:00'));
  const res = await request('GET', '/api/sessions');
  assert.deepEqual(res.json.map((s) => s.course), ['A', 'B', 'C']);
});

apiTest('DELETE /api/sessions/:id menghapus (204); id tidak ada memberi 404; id salah memberi 400', async ({ request }) => {
  const { json } = await request('POST', '/api/sessions', session('A', 0, '08:00', '09:00'));
  assert.equal((await request('DELETE', `/api/sessions/${json.id}`)).status, 204);
  assert.equal((await request('DELETE', `/api/sessions/${json.id}`)).status, 404);
  assert.equal((await request('DELETE', '/api/sessions/abc')).status, 400);
  assert.equal((await request('GET', '/api/sessions')).json.length, 0);
});

apiTest('id sesi unik setelah ada yang dihapus', async ({ request }) => {
  const ids = [];
  for (const [c, d] of [['A', 0], ['B', 1], ['C', 2]]) ids.push((await request('POST', '/api/sessions', session(c, d, '08:00', '09:00'))).json.id);
  await request('DELETE', `/api/sessions/${ids[0]}`);
  ids.push((await request('POST', '/api/sessions', session('D', 3, '08:00', '09:00'))).json.id);
  assert.equal(new Set(ids).size, ids.length, `id duplikat: ${ids.join(',')}`);
});
