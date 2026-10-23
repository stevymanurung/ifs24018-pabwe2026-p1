import { Card } from '../../components/ui/Card.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { FormError } from '../../components/ui/FormError.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';
import { usePlanner } from '../../hooks/usePlanner.js';
import { useSubmit } from '../../hooks/useSubmit.js';
import { AlarmForm } from './components/AlarmForm.jsx';
import { AlarmList } from './components/AlarmList.jsx';
import { ReminderSettings } from './components/ReminderSettings.jsx';
import { useReminder } from './useReminder.js';

export default function RemindersPage() {
  const { alarms, settings } = usePlanner();
  const controls = useReminder();
  const { submit: runAction, error: actionError } = useSubmit((operation) => operation());

  const changeLead = (lead) => runAction(() => settings.updateReminderLead(lead));
  const toggleAlarm = (alarm) => runAction(() => alarms.update(alarm.id, { enabled: !alarm.enabled }));
  const removeAlarm = (id) => runAction(() => alarms.remove(id));

  return (
    <Card>
      <ReminderSettings lead={settings.reminderLead} onChangeLead={changeLead} controls={controls} />
      <hr className="my-5 border-slate-200" />
      <AlarmForm onCreate={alarms.create} />
      <FormError message={actionError} />
      {alarms.status === 'loading' && <LoadingState />}
      {alarms.status === 'error' && <ErrorBanner message={alarms.error.message} onRetry={alarms.reload} />}
      {alarms.status === 'ready' && <AlarmList alarms={alarms.items} onToggle={toggleAlarm} onRemove={removeAlarm} />}
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Catatan: alarm hanya berbunyi selama halaman ini terbuka di browser (tab boleh di latar belakang).
      </p>
    </Card>
  );
}
