import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../app/routes.js';
import { usePlanner } from '../../hooks/usePlanner.js';
import { countPending } from '../../lib/tasks.js';
import { NextClassCard } from './NextClassCard.jsx';

const LINK_BASE =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-indigo-400';
const LINK_ACTIVE = 'bg-indigo-600 text-white';
const LINK_IDLE = 'text-slate-300 hover:bg-slate-800 hover:text-white';

/** Sidebar kiri: tetap terlihat di layar lebar, menjadi panel geser di ponsel. */
export function Sidebar({ open, onNavigate }) {
  const { tasks, alarms, dashboard } = usePlanner();
  const badgeCounts = {
    pendingTasks: countPending(tasks.items),
    activeAlarms: alarms.items.filter((alarm) => alarm.enabled).length,
  };

  return (
    <aside
      id="sidebar"
      aria-label="Menu utama"
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white" aria-hidden="true">
          SP
        </span>
        <div>
          <p className="text-base leading-tight font-semibold text-white">Study Planner</p>
          <p className="text-xs text-slate-400">Jadwal, tugas, alarm</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {ROUTES.map(({ path, title, navLabel, Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onNavigate}
            className={({ isActive }) => `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_IDLE}`}
          >
            <Icon />
            <span className="flex-1">{navLabel ?? title}</span>
            {badge && (
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-white" aria-label={`${badgeCounts[badge]} item`}>
                {badgeCounts[badge]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <NextClassCard next={dashboard.data?.nextSession ?? null} />
    </aside>
  );
}
