import { Button } from '../../../components/ui/Button.jsx';

/** Satu baris tugas. `overdue` dihitung oleh pemanggil sehingga komponen ini murni tampilan. */
export function TaskItem({ task, overdue, onToggle, onRemove }) {
  const details = [
    task.course,
    task.dueDate && `Tenggat: ${task.dueDate}${overdue ? ' (terlambat)' : ''}`,
    task.remindAt && `Ingatkan ${task.remindAt}`,
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 border-b border-slate-200 px-1 py-3">
      <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer accent-emerald-600"
        checked={task.done}
        aria-label={`Tandai selesai: ${task.title}`}
        onChange={() => onToggle(task)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`text-sm font-medium break-words ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</span>
        {details.length > 0 && <span className={`text-xs ${overdue ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{details.join(' | ')}</span>}
      </span>
      <Button variant="danger" size="sm" aria-label={`Hapus tugas ${task.title}`} onClick={() => onRemove(task.id)}>
        Hapus
      </Button>
    </li>
  );
}
