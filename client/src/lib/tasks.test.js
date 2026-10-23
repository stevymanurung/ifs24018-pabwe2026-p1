import { describe, expect, it } from 'vitest';
import { countPending, filterTasks, isOverdue } from './tasks.js';

const NOW = new Date(2026, 9, 19, 10, 0);
const task = (overrides) => ({ id: 1, title: 't', dueDate: '', done: false, ...overrides });

describe('isOverdue', () => {
  it('tenggat hari ini belum terlambat, kemarin terlambat', () => {
    expect(isOverdue(task({ dueDate: '2026-10-19' }), NOW)).toBe(false);
    expect(isOverdue(task({ dueDate: '2026-10-18' }), NOW)).toBe(true);
  });

  it('tugas selesai atau tanpa tenggat tidak pernah terlambat', () => {
    expect(isOverdue(task({ dueDate: '2026-10-18', done: true }), NOW)).toBe(false);
    expect(isOverdue(task({ dueDate: '' }), NOW)).toBe(false);
  });
});

describe('filterTasks dan countPending', () => {
  const tasks = [task({ id: 1 }), task({ id: 2, done: true }), task({ id: 3 })];

  it('menyaring menurut status', () => {
    expect(filterTasks(tasks, 'active').map((t) => t.id)).toEqual([1, 3]);
    expect(filterTasks(tasks, 'done').map((t) => t.id)).toEqual([2]);
    expect(filterTasks(tasks, 'all')).toHaveLength(3);
  });

  it('filter tidak dikenal diperlakukan sebagai "semua"', () => {
    expect(filterTasks(tasks, 'lain')).toHaveLength(3);
  });

  it('countPending menghitung yang belum selesai', () => {
    expect(countPending(tasks)).toBe(2);
  });
});
