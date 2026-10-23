import { Button } from '../../../components/ui/Button.jsx';
import { DAY_SHORT_NAMES } from '../../../lib/time.js';

export function AlarmItem({ alarm, onToggle, onRemove }) {
  const muted = alarm.enabled ? '' : 'text-slate-400 line-through';

  return (
    <li className="flex items-center gap-4 border-b border-slate-200 px-1 py-3">
      <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer accent-indigo-600"
        checked={alarm.enabled}
        aria-label={`Aktifkan alarm ${alarm.label}`}
        onChange={() => onToggle(alarm)}
      />
      <span className={`w-16 text-lg font-bold ${alarm.enabled ? 'text-indigo-600' : muted}`}>{alarm.time}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`text-sm font-medium break-words ${alarm.enabled ? 'text-slate-800' : muted}`}>{alarm.label}</span>
        <span className="text-xs text-slate-500">{alarm.days.map((day) => DAY_SHORT_NAMES[day]).join(', ')}</span>
      </span>
      <Button variant="danger" size="sm" aria-label={`Hapus alarm ${alarm.label}`} onClick={() => onRemove(alarm.id)}>
        Hapus
      </Button>
    </li>
  );
}
