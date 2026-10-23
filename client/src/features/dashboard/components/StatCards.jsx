import { formatHours } from '../../../lib/format.js';
import { StatCard } from './StatCard.jsx';

export function StatCards({ totals }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Tugas belum selesai" value={totals.pending} accent="indigo" />
      <StatCard label="Tugas selesai" value={totals.done} accent="emerald" />
      <StatCard label="Tugas terlambat" value={totals.overdue} accent="red" />
      <StatCard label="Jam belajar per pekan" value={formatHours(totals.weeklyHours)} unit="jam" accent="amber" />
    </div>
  );
}
