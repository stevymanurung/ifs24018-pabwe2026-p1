const ACCENTS = {
  indigo: 'border-indigo-500',
  emerald: 'border-emerald-500',
  red: 'border-red-500',
  amber: 'border-amber-500',
};

export function StatCard({ label, value, unit, accent }) {
  return (
    <div className={`rounded-2xl border-t-4 bg-white p-5 shadow-sm ring-1 ring-slate-200 ${ACCENTS[accent]}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>}
      </p>
    </div>
  );
}
