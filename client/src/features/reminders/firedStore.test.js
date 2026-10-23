import { describe, expect, it } from 'vitest';
import { loadReminderState, saveReminderState } from './firedStore.js';

const fakeStorage = (raw) => {
  const data = raw === undefined ? {} : { 'study-planner:reminder-state': raw };
  return { getItem: (key) => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
};

describe('firedStore', () => {
  const empty = { fired: {}, snoozes: [] };

  it('penyimpanan kosong atau rusak menghasilkan nilai kosong, bukan error', () => {
    expect(loadReminderState(fakeStorage(undefined))).toEqual(empty);
    expect(loadReminderState(fakeStorage('{rusak'))).toEqual(empty);
    expect(loadReminderState(fakeStorage('123'))).toEqual(empty);
  });

  it('item tunda yang bentuknya salah disaring satu per satu', () => {
    const raw = JSON.stringify({ fired: {}, snoozes: [{ key: 'a', text: 'ok', at: 5 }, { bad: true }] });
    expect(loadReminderState(fakeStorage(raw)).snoozes).toHaveLength(1);
  });

  it('simpan lalu muat menghasilkan data sama', () => {
    const storage = fakeStorage();
    const state = { fired: { 'alarm:1:2026-10-19': 5 }, snoozes: [{ key: 'a', title: 'T', text: 'x', at: 9 }] };
    saveReminderState(state, storage);
    expect(loadReminderState(storage)).toEqual(state);
  });

  it('gagal menyimpan (penyimpanan penuh) tidak melempar error', () => {
    const full = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    expect(() => saveReminderState({ fired: {}, snoozes: [] }, full)).not.toThrow();
  });

  it('penyimpanan yang melempar saat membaca tidak membuat aplikasi crash', () => {
    const blocked = { getItem: () => { throw new Error('storage blocked'); }, setItem: () => {} };
    expect(loadReminderState(blocked)).toEqual(empty);
  });
});
