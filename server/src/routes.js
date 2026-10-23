import { Router } from 'express';
import { createAlarmRoutes } from './modules/alarms/alarms.routes.js';
import { createDashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { createSessionRoutes } from './modules/sessions/sessions.routes.js';
import { createSettingsRoutes } from './modules/settings/settings.routes.js';
import { createTaskRoutes } from './modules/tasks/tasks.routes.js';
import { createAuthRoutes, requireAuth } from './modules/auth/auth.js';

/** Semua endpoint API dikumpulkan di sini dan dipasang di bawah /api. */
export function createApiRouter(controllers, db) {
  const router = Router();
  router.get('/health', (_req, res) => res.json({ status: 'ok' }));
  router.use('/auth', createAuthRoutes(db));
  const auth = requireAuth(db);
  router.use('/sessions', auth, createSessionRoutes(controllers.sessions));
  router.use('/tasks', auth, createTaskRoutes(controllers.tasks));
  router.use('/alarms', auth, createAlarmRoutes(controllers.alarms));
  router.use('/settings', auth, createSettingsRoutes(controllers.settings));
  router.use('/dashboard', auth, createDashboardRoutes(controllers.dashboard));
  return router;
}
