import { useContext } from 'react';
import { ReminderContext } from './reminderContext.js';

export function useReminder() {
  const context = useContext(ReminderContext);
  if (!context) throw new Error('useReminder harus dipakai di dalam <ReminderProvider>');
  return context;
}
