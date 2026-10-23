import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { AlarmItem } from './AlarmItem.jsx';

export function AlarmList({ alarms, onToggle, onRemove }) {
  if (alarms.length === 0) return <EmptyState>Belum ada alarm kustom.</EmptyState>;

  return (
    <ul className="mt-2">
      {alarms.map((alarm) => (
        <AlarmItem key={alarm.id} alarm={alarm} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
