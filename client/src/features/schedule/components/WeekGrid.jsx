import { DayColumn } from './DayColumn.jsx';

export function WeekGrid({ days, onRemove }) {
  return (
    <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {days.map(({ day, name, sessions }) => (
        <DayColumn key={day} name={name} sessions={sessions} onRemove={onRemove} />
      ))}
    </div>
  );
}
