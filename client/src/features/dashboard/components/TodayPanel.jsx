const CHIP_CLASSES = {
  indigo: 'bg-indigo-50 text-indigo-700',
  amber: 'bg-amber-50 text-amber-700',
};

function Entry({ chip, tone, text }) {
  return (
    <li className="flex gap-2 text-sm">
      <span className={`shrink-0 self-start rounded px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap ${CHIP_CLASSES[tone]}`}>{chip}</span>
      <span className="min-w-0 break-words">{text}</span>
    </li>
  );
}

function Section({ title, empty, children, hasItems }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <ul className="mt-2 space-y-1.5">{hasItems ? children : <li className="text-sm text-slate-400">{empty}</li>}</ul>
    </div>
  );
}

/** Ringkasan harian: jadwal hari ini dan tugas yang jatuh tempo 7 hari ke depan. */
export function TodayPanel({ today, upcomingTasks }) {
  return (
    <div className="space-y-5">
      <Section title={`Jadwal hari ini (${today.dayName})`} empty="Tidak ada jadwal hari ini." hasItems={today.sessions.length > 0}>
        {today.sessions.map((session) => (
          <Entry key={session.id} tone="indigo" chip={`${session.start} - ${session.end}`} text={session.course} />
        ))}
      </Section>
      <Section title="Tugas 7 hari ke depan" empty="Tidak ada tugas dalam 7 hari ke depan." hasItems={upcomingTasks.length > 0}>
        {upcomingTasks.map((task) => (
          <Entry key={task.id} tone="amber" chip={task.dueDate} text={task.title} />
        ))}
      </Section>
    </div>
  );
}
