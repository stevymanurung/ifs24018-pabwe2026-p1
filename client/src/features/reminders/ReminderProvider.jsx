import { usePlanner } from '../../hooks/usePlanner.js';
import { RingDialog } from './components/RingDialog.jsx';
import { ReminderContext } from './reminderContext.js';
import { useReminderEngine } from './useReminderEngine.js';

/** Dipasang di atas seluruh halaman agar alarm tetap berjalan di halaman mana pun yang sedang dibuka. */
export function ReminderProvider({ children }) {
  const { alarms, sessions, tasks, settings } = usePlanner();
  const engine = useReminderEngine({
    alarms: alarms.items,
    sessions: sessions.items,
    tasks: tasks.items,
    lead: settings.reminderLead,
  });

  return (
    <ReminderContext.Provider value={engine.controls}>
      {children}
      <RingDialog reminders={engine.ringing} onDismiss={engine.dismiss} onSnooze={engine.snooze} />
    </ReminderContext.Provider>
  );
}
