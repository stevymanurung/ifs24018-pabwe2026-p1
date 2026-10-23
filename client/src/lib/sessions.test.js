import { describe, expect, it } from 'vitest';
import { groupSessionsByDay, uniqueCourses } from './sessions.js';

const sessions = [
  { id: 1, course: 'A', day: 0 },
  { id: 2, course: 'B', day: 0 },
  { id: 3, course: 'A', day: 2 },
];

describe('groupSessionsByDay', () => {
  it('selalu menghasilkan 7 hari dan mempertahankan urutan', () => {
    const groups = groupSessionsByDay(sessions);
    expect(groups).toHaveLength(7);
    expect(groups[0].sessions.map((s) => s.id)).toEqual([1, 2]);
    expect(groups[1].sessions).toEqual([]);
    expect(groups[2].name).toBe('Rabu');
  });
});

describe('uniqueCourses', () => {
  it('menghapus nama mata kuliah ganda', () => {
    expect(uniqueCourses(sessions)).toEqual(['A', 'B']);
  });
});
