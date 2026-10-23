import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../../src/app.js';
import { openDatabase } from '../../src/db/connection.js';

async function withClientBuild(run) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'client-dist-'));
  fs.writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>Study Planner</title><div id="root"></div>');
  const db = openDatabase(':memory:');
  const server = await new Promise((resolve) => {
    const instance = createApp({ db, clientDist: dist, logger: { error() {} } }).listen(0, '127.0.0.1', () => resolve(instance));
  });
  try {
    await run(`http://127.0.0.1:${server.address().port}`, dist);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    fs.rmSync(dist, { recursive: true, force: true });
  }
}

test('menyajikan index.html di akar dan memberi fallback SPA untuk rute front-end', async () => {
  await withClientBuild(async (base) => {
    for (const route of ['/', '/tugas', '/jadwal']) {
      const res = await fetch(base + route);
      assert.equal(res.status, 200, route);
      assert.match(await res.text(), /id="root"/);
    }
  });
});

test('path CLIENT_DIST relatif tetap berfungsi (regresi: sendFile menolak path relatif)', async () => {
  await withClientBuild(async (base, dist) => {
    const relative = path.relative(process.cwd(), dist);
    const db = openDatabase(':memory:');
    const server = await new Promise((resolve) => {
      const instance = createApp({ db, clientDist: relative, logger: { error() {} } }).listen(0, '127.0.0.1', () => resolve(instance));
    });
    try {
      const res = await fetch(`http://127.0.0.1:${server.address().port}/tugas`);
      assert.equal(res.status, 200);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      db.close();
    }
    assert.ok(base);
  });
});

test('permintaan /api yang tidak dikenal tetap JSON 404, bukan index.html', async () => {
  await withClientBuild(async (base) => {
    const res = await fetch(`${base}/api/tidak-ada`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NOT_FOUND');
  });
});
