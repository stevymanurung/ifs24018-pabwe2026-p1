import { Router } from 'express';
import { createAlarmRoutes } from './modules/alarms/alarms.routes.js';
import { createDashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { createSessionRoutes } from './modules/sessions/sessions.routes.js';
import { createSettingsRoutes } from './modules/settings/settings.routes.js';
import { createTaskRoutes } from './modules/tasks/tasks.routes.js';

/** Semua endpoint API dikumpulkan di sini dan dipasang di bawah /api. */
export function createApiRouter(controllers) {
  const router = Router();
  router.get('/health', (_req, res) => res.json({ status: 'ok' }));
  router.use('/sessions', createSessionRoutes(controllers.sessions));
  router.use('/tasks', createTaskRoutes(controllers.tasks));
  router.use('/alarms', createAlarmRoutes(controllers.alarms));
  router.use('/settings', createSettingsRoutes(controllers.settings));
  router.use('/dashboard', createDashboardRoutes(controllers.dashboard));
  return router;
}
