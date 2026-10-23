import { SessionItem } from './SessionItem.jsx';

export function DayColumn({ name, sessions, onRemove }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3" aria-label={`Jadwal hari ${name}`}>
      <h3 className="text-sm font-semibold text-slate-700">{name}</h3>
      <ul className="mt-1">
        {sessions.length === 0 ? (
          <li className="py-2 text-sm text-slate-400">Kosong</li>
        ) : (
          sessions.map((session) => <SessionItem key={session.id} session={session} onRemove={onRemove} />)
        )}
      </ul>
    </section>
  );
}
