import { lazy } from 'react';
import { BellIcon, CalendarIcon, DashboardIcon, TaskIcon } from '../components/ui/icons.jsx';

/**
 * Sumber kebenaran tunggal untuk navigasi: Router, Sidebar, dan judul halaman semuanya membaca daftar ini.
 * Halaman dimuat malas (code splitting) sehingga pustaka chart hanya diunduh saat dashboard dibuka.
 * `badge` menunjuk kunci pada hitungan yang dihitung Sidebar.
 */
export const ROUTES = [
  {
    path: '/',
    title: 'Dashboard',
    Icon: DashboardIcon,
    Page: lazy(() => import('../features/dashboard/DashboardPage.jsx')),
  },
  {
    path: '/jadwal',
    title: 'Jadwal Pembelajaran',
    navLabel: 'Jadwal',
    Icon: CalendarIcon,
    Page: lazy(() => import('../features/schedule/SchedulePage.jsx')),
  },
  {
    path: '/tugas',
    title: 'Tugas',
    Icon: TaskIcon,
    badge: 'pendingTasks',
    Page: lazy(() => import('../features/tasks/TasksPage.jsx')),
  },
  {
    path: '/pengingat',
    title: 'Pengingat dan Alarm',
    navLabel: 'Pengingat',
    Icon: BellIcon,
    badge: 'activeAlarms',
    Page: lazy(() => import('../features/reminders/RemindersPage.jsx')),
  },
];
