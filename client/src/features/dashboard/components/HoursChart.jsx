import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { formatHours } from '../../../lib/format.js';
import { CHART_COLORS } from '../chartColors.js';

/** Batang jam belajar per hari (Senin-Minggu). */
export function HoursChart({ data }) {
  if (data.every((day) => day.hours === 0)) return <EmptyState>Belum ada jadwal. Tambahkan di menu Jadwal.</EmptyState>;

  return (
    <div className="h-64" role="img" aria-label="Grafik batang jam belajar per hari">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} />
          <YAxis tickLine={false} unit=" j" />
          <Tooltip formatter={(hours) => [`${formatHours(hours)} jam`, 'Jam belajar']} />
          <Bar dataKey="hours" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
