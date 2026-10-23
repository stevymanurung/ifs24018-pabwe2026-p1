import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { CHART_COLORS } from '../chartColors.js';

const ROW_HEIGHT = 44;
const MIN_HEIGHT = 200;

/** Batang bertumpuk: tugas selesai dan belum selesai per mata kuliah. */
export function CourseChart({ data }) {
  if (data.length === 0) return <EmptyState>Belum ada tugas.</EmptyState>;

  return (
    <div style={{ height: Math.max(MIN_HEIGHT, data.length * ROW_HEIGHT + 70) }} role="img" aria-label="Grafik batang tugas per mata kuliah">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="course" width={150} tickLine={false} />
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Bar dataKey="done" name="Selesai" stackId="tasks" fill={CHART_COLORS.success} />
          <Bar dataKey="pending" name="Belum selesai" stackId="tasks" fill={CHART_COLORS.muted} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
