import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { STATUS_COLORS } from '../chartColors.js';

/** Donat status tugas: selesai, aktif, terlambat. */
export function StatusChart({ data }) {
  if (data.every((slice) => slice.value === 0)) return <EmptyState>Belum ada tugas.</EmptyState>;

  return (
    <div className="h-64" role="img" aria-label="Grafik donat status tugas">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
            {data.map((slice) => (
              <Cell key={slice.key} fill={STATUS_COLORS[slice.key]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
