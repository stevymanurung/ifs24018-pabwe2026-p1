import { useMemo } from 'react';
import { useCollection } from '../hooks/useCollection.js';
import { useDashboard } from '../hooks/useDashboard.js';
import { useSettings } from '../hooks/useSettings.js';
import { alarmsApi } from '../services/alarmsApi.js';
import { sessionsApi } from '../services/sessionsApi.js';
import { tasksApi } from '../services/tasksApi.js';
import { PlannerContext } from './plannerContext.js';

/** Satu-satunya tempat data server dimuat; halaman dan komponen cukup memanggil usePlanner(). */
export function PlannerProvider({ children }) {
  const sessions = useCollection(sessionsApi);
  const tasks = useCollection(tasksApi);
  const alarms = useCollection(alarmsApi);
  const settings = useSettings();
  const dashboard = useDashboard(sessions.items, tasks.items);

  const value = useMemo(
    () => ({ sessions, tasks, alarms, settings, dashboard }),
    [sessions, tasks, alarms, settings, dashboard],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
