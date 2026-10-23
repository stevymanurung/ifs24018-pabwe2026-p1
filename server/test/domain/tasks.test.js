import test from 'node:test';
import assert from 'node:assert/strict';
import { NO_COURSE_LABEL, groupByCourse, isOverdue, summarizeStatus, upcomingTasks } from '../../src/domain/tasks.js';

const NOW = new Date(2026, 9, 19, 10, 0); // Senin 19 Okt 2026 10:00
const t = (dueDate, done = false, extra = {}) => ({ title: 't', dueDate, done, course: '', ...extra });

test('tenggat hari ini belum terlambat; kemarin terlambat; selesai tidak', () => {
  assert.equal(isOverdue(t('2026-10-19'), NOW), false);
  assert.equal(isOverdue(t('2026-10-18'), NOW), true);
  assert.equal(isOverdue(t('2026-10-18', true), NOW), false);
  assert.equal(isOverdue(t(''), NOW), false);
});

test('summarizeStatus memisahkan selesai, aktif, dan terlambat', () => {
  const tasks = [t('2026-10-17'), t('2026-10-19'), t('2026-10-22'), t('2026-10-14', true), t('')];
  assert.deepEqual(summarizeStatus(tasks, NOW), { done: 1, active: 3, overdue: 1 });
});

test('groupByCourse menggabungkan mata kuliah kosong dan mengurutkan dari terbanyak', () => {
  const groups = groupByCourse([
    t('', true, { course: 'Basis Data' }), t('', false, { course: 'Basis Data' }),
    t('', false, { course: '' }), t('', false, { course: undefined }), t('', false, { course: 'Jaringan' }),
  ]);
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.find((g) => g.course === 'Basis Data'), { course: 'Basis Data', done: 1, pending: 1 });
  assert.equal(groups.find((g) => g.course === NO_COURSE_LABEL).pending, 2);
});

test('upcomingTasks: hari ini sampai 7 hari ke depan, terurut, tanpa yang selesai atau lewat', () => {
  const tasks = [t('2026-10-30'), t('2026-10-21'), t('2026-10-19'), t('2026-10-17'), t('2026-10-20', true)];
  assert.deepEqual(upcomingTasks(tasks, NOW, 7).map((x) => x.dueDate), ['2026-10-19', '2026-10-21']);
});
