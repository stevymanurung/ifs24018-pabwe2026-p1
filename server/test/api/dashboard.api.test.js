import assert from 'node:assert/strict';
import { NOW, apiTest, session } from '../helpers/testServer.js';

const get = (request, now = NOW) => request('GET', `/api/dashboard?now=${now}`);

apiTest('dashboard tanpa data: semua nol dan 7 hari', async ({ request }) => {
  const { status, json } = await get(request);
  assert.equal(status, 200);
  assert.deepEqual(json.totals, { pending: 0, done: 0, overdue: 0, weeklyHours: 0 });
  assert.equal(json.hoursPerDay.length, 7);
  assert.equal(json.nextSession, null);
});

apiTest('jam belajar memperhitungkan menit (08:00-09:40 = 1,67 jam) dan total pekan', async ({ request }) => {
  await request('POST', '/api/sessions', session('A', 0, '08:00', '10:00'));
  await request('POST', '/api/sessions', session('B', 2, '08:00', '09:40'));
  await request('POST', '/api/sessions', session('C', 4, '08:00', '10:30'));
  const { json } = await get(request);
  assert.deepEqual(json.hoursPerDay.map((d) => d.hours).slice(0, 5), [2, 0, 1.67, 0, 2.5]);
  assert.equal(json.totals.weeklyHours, 6.17);
});

apiTest('status tugas: tenggat hari ini BUKAN terlambat', async ({ request }) => {
  await request('POST', '/api/tasks', { title: 'lewat', dueDate: '2026-10-17' });
  await request('POST', '/api/tasks', { title: 'hari ini', dueDate: '2026-10-19' });
  await request('POST', '/api/tasks', { title: 'depan', dueDate: '2026-10-22' });
  const selesai = (await request('POST', '/api/tasks', { title: 'selesai', dueDate: '2026-10-14' })).json;
  await request('PATCH', `/api/tasks/${selesai.id}`, { done: true });
  const { json } = await get(request);
  assert.deepEqual(json.totals, { pending: 3, done: 1, overdue: 1, weeklyHours: 0 });
  assert.deepEqual(json.taskStatus.map((s) => s.value), [1, 2, 1]);
});

apiTest('tugas per mata kuliah: kosong diberi label dan tidak muncul "undefined"', async ({ request }) => {
  await request('POST', '/api/tasks', { title: 'a', course: 'Basis Data' });
  await request('POST', '/api/tasks', { title: 'b', course: 'Basis Data' });
  await request('POST', '/api/tasks', { title: 'c' });
  const { json } = await get(request);
  assert.equal(json.tasksPerCourse[0].course, 'Basis Data');
  assert.ok(json.tasksPerCourse.some((g) => g.course === 'Tanpa mata kuliah'));
  assert.ok(!json.tasksPerCourse.some((g) => g.course === 'undefined' || g.course === ''));
});

apiTest('panel hari ini dan kuliah berikutnya mengikuti waktu lokal pengguna', async ({ request }) => {
  await request('POST', '/api/sessions', session('PAGI', 0, '08:00', '09:00'));
  await request('POST', '/api/sessions', session('SIANG', 0, '13:00', '15:00'));
  await request('POST', '/api/sessions', session('SELASA', 1, '08:00', '09:00'));
  const { json } = await get(request); // Senin 10:00
  assert.equal(json.today.dayName, 'Senin');
  assert.deepEqual(json.today.sessions.map((s) => s.course), ['PAGI', 'SIANG']);
  assert.equal(json.nextSession.session.course, 'SIANG');
  assert.equal(json.nextSession.daysAhead, 0);
  const later = (await get(request, '2026-10-19T16:00')).json;
  assert.equal(later.nextSession.session.course, 'SELASA');
  assert.equal(later.nextSession.daysAhead, 1);
});

apiTest('parameter now yang salah ditolak (400)', async ({ request }) => {
  assert.equal((await request('GET', '/api/dashboard?now=kemarin')).status, 400);
  assert.equal((await request('GET', '/api/dashboard?now=2026-10-19')).status, 400);
});
