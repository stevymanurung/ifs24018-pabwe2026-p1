import assert from 'node:assert/strict';
import { apiTest } from '../helpers/testServer.js';

apiTest('POST /api/alarms membuat alarm: jam dinormalkan, hari unik dan terurut, label bawaan', async ({ request }) => {
  const res = await request('POST', '/api/alarms', { label: '', time: '8:05', days: [2, 0, 2] });
  assert.equal(res.status, 201);
  assert.deepEqual({ ...res.json, id: undefined }, { id: undefined, label: 'Alarm', time: '08:05', days: [0, 2], enabled: true });
});

apiTest('POST /api/alarms menolak jam salah, tanpa hari, dan hari di luar 0-6', async ({ request }) => {
  assert.equal((await request('POST', '/api/alarms', { label: 'A', time: '25:00', days: [0] })).status, 400);
  assert.equal((await request('POST', '/api/alarms', { label: 'A', time: 'abc', days: [0] })).status, 400);
  assert.equal((await request('POST', '/api/alarms', { label: 'A', time: '08:00', days: [] })).status, 400);
  assert.equal((await request('POST', '/api/alarms', { label: 'A', time: '08:00', days: [9] })).status, 400);
  assert.equal((await request('POST', '/api/alarms', { label: 'A', time: '08:00' })).status, 400);
});

apiTest('PATCH dan DELETE /api/alarms/:id', async ({ request }) => {
  const a = (await request('POST', '/api/alarms', { label: 'A', time: '08:00', days: [0] })).json;
  const off = await request('PATCH', `/api/alarms/${a.id}`, { enabled: false });
  assert.equal(off.json.enabled, false);
  assert.equal((await request('PATCH', '/api/alarms/999', { enabled: true })).status, 404);
  assert.equal((await request('DELETE', `/api/alarms/${a.id}`)).status, 204);
  assert.equal((await request('DELETE', `/api/alarms/${a.id}`)).status, 404);
});

apiTest('id alarm unik setelah ada yang dihapus', async ({ request }) => {
  const ids = [];
  for (const t of ['08:00', '09:00', '10:00']) ids.push((await request('POST', '/api/alarms', { label: t, time: t, days: [0] })).json.id);
  await request('DELETE', `/api/alarms/${ids[0]}`);
  ids.push((await request('POST', '/api/alarms', { label: 'D', time: '11:00', days: [0] })).json.id);
  assert.equal(new Set(ids).size, ids.length, `id duplikat: ${ids.join(',')}`);
});

apiTest('GET/PUT /api/settings: bawaan 10 menit; hanya nilai yang diizinkan', async ({ request }) => {
  assert.deepEqual((await request('GET', '/api/settings')).json, { reminderLead: 10 });
  assert.deepEqual((await request('PUT', '/api/settings', { reminderLead: 15 })).json, { reminderLead: 15 });
  assert.deepEqual((await request('GET', '/api/settings')).json, { reminderLead: 15 });
  assert.equal((await request('PUT', '/api/settings', { reminderLead: 7 })).status, 400);
  assert.equal((await request('PUT', '/api/settings', { reminderLead: 'x' })).status, 400);
});
