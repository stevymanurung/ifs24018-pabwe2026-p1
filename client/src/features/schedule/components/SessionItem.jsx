import { Button } from '../../../components/ui/Button.jsx';

export function SessionItem({ session, onRemove }) {
  return (
    <li className="flex items-start gap-3 border-t border-slate-200 py-2.5">
      <span className="mt-0.5 shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
        {session.start} - {session.end}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium break-words text-slate-800">{session.course}</span>
        {session.room && <span className="text-xs text-slate-500">Ruang: {session.room}</span>}
      </span>
      <Button variant="danger" size="sm" aria-label={`Hapus sesi ${session.course}`} onClick={() => onRemove(session.id)}>
        Hapus
      </Button>
    </li>
  );
}
