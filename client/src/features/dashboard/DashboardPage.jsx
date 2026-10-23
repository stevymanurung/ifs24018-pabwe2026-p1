import { Card } from '../../components/ui/Card.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';
import { usePlanner } from '../../hooks/usePlanner.js';
import { CourseChart } from './components/CourseChart.jsx';
import { HoursChart } from './components/HoursChart.jsx';
import { StatCards } from './components/StatCards.jsx';
import { StatusChart } from './components/StatusChart.jsx';
import { TodayPanel } from './components/TodayPanel.jsx';

export default function DashboardPage() {
  const { data, status, error } = usePlanner().dashboard;

  if (!data) return status === 'error' ? <ErrorBanner message={error.message} /> : <LoadingState />;

  return (
    <div className="space-y-6">
      {status === 'error' && <ErrorBanner message={`Gagal memperbarui data: ${error.message}`} />}
      <StatCards totals={data.totals} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Jam belajar per hari" className="lg:col-span-2">
          <HoursChart data={data.hoursPerDay} />
        </Card>
        <Card title="Status tugas">
          <StatusChart data={data.taskStatus} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Tugas per mata kuliah" className="lg:col-span-2">
          <CourseChart data={data.tasksPerCourse} />
        </Card>
        <Card>
          <TodayPanel today={data.today} upcomingTasks={data.upcomingTasks} />
        </Card>
      </div>
    </div>
  );
}
