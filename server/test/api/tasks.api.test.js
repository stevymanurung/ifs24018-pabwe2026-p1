import assert from 'node:assert/strict';
import { apiTest } from '../helpers/testServer.js';

apiTest('POST /api/tasks membuat tugas valid (201) dengan nilai bawaan', async ({ request }) => {
  const res = await request('POST', '/api/tasks', { title: 'Laporan' });
  assert.equal(res.status, 201);
  assert.deepEqual({ ...res.json, id: undefined }, { id: undefined, title: 'Laporan', course: '', dueDate: '', remindAt: '', done: false });
});

apiTest('POST /api/tasks menolak judul kosong, terlalu panjang, dan tanggal tidak valid', async ({ request }) => {
  assert.equal((await request('POST', '/api/tasks', { title: '   ' })).status, 400);
  assert.equal((await request('POST', '/api/tasks', { title: 'x'.repeat(101) })).status, 400);
  assert.equal((await request('POST', '/api/tasks', { title: 'A', dueDate: '2026-02-30' })).status, 400);
  assert.equal((await request('POST', '/api/tasks', {})).status, 400);
});

apiTest('pengingat tugas butuh tenggat dan jam valid; jam dinormalkan', async ({ request }) => {
  assert.equal((await request('POST', '/api/tasks', { title: 'A', remindAt: '09:00' })).status, 400);
  assert.equal((await request('POST', '/api/tasks', { title: 'A', dueDate: '2026-10-20', remindAt: 'abc' })).status, 400);
  const ok = await request('POST', '/api/tasks', { title: 'A', dueDate: '2026-10-20', remindAt: '9:00' });
  assert.equal(ok.status, 201);
  assert.equal(ok.json.remindAt, '09:00');
});

apiTest("judul berisi tanda petik dan SQL tersimpan apa adanya (aman dari SQL injection)", async ({ request }) => {
  const evil = "x'); DELETE FROM tasks; --";
  await request('POST', '/api/tasks', { title: 'Aman' });
  const res = await request('POST', '/api/tasks', { title: evil });
  assert.equal(res.status, 201);
  assert.equal(res.json.title, evil);
  const list = await request('GET', '/api/tasks');
  assert.equal(list.json.length, 2, 'tabel tidak boleh terhapus');
  assert.ok(list.json.some((t) => t.title === evil), 'judul tersimpan utuh');
});

apiTest('PATCH /api/tasks/:id mengubah status selesai; id tidak ada 404; body salah 400', async ({ request }) => {
  const { json } = await request('POST', '/api/tasks', { title: 'A' });
  const done = await request('PATCH', `/api/tasks/${json.id}`, { done: true });
  assert.equal(done.status, 200);
  assert.equal(done.json.done, true);
  assert.equal((await request('PATCH', '/api/tasks/999', { done: true })).status, 404);
  assert.equal((await request('PATCH', `/api/tasks/${json.id}`, { done: 'ya' })).status, 400);
});

apiTest('GET /api/tasks?status= menyaring aktif dan selesai; status tidak dikenal 400', async ({ request }) => {
  const a = (await request('POST', '/api/tasks', { title: 'A' })).json;
  await request('POST', '/api/tasks', { title: 'B' });
  await request('PATCH', `/api/tasks/${a.id}`, { done: true });
  assert.equal((await request('GET', '/api/tasks?status=active')).json.length, 1);
  assert.equal((await request('GET', '/api/tasks?status=done')).json.length, 1);
  assert.equal((await request('GET', '/api/tasks')).json.length, 2);
  assert.equal((await request('GET', '/api/tasks?status=lain')).status, 400);
});

apiTest('DELETE /api/tasks/:id menghapus tepat satu tugas; id tidak ada 404', async ({ request }) => {
  const a = (await request('POST', '/api/tasks', { title: 'A' })).json;
  const b = (await request('POST', '/api/tasks', { title: 'B' })).json;
  assert.equal((await request('DELETE', `/api/tasks/${a.id}`)).status, 204);
  assert.deepEqual((await request('GET', '/api/tasks')).json.map((t) => t.id), [b.id]);
  assert.equal((await request('DELETE', `/api/tasks/${a.id}`)).status, 404);
});
