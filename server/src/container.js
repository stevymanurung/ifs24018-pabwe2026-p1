import { createAlarmController } from './modules/alarms/alarms.controller.js';
import { createAlarmRepository } from './modules/alarms/alarms.repository.js';
import { createAlarmService } from './modules/alarms/alarms.service.js';
import { createDashboardController } from './modules/dashboard/dashboard.controller.js';
import { createDashboardService } from './modules/dashboard/dashboard.service.js';
import { createSessionController } from './modules/sessions/sessions.controller.js';
import { createSessionRepository } from './modules/sessions/sessions.repository.js';
import { createSessionService } from './modules/sessions/sessions.service.js';
import { createSettingsController } from './modules/settings/settings.controller.js';
import { createSettingsRepository } from './modules/settings/settings.repository.js';
import { createSettingsService } from './modules/settings/settings.service.js';
import { createTaskController } from './modules/tasks/tasks.controller.js';
import { createTaskRepository } from './modules/tasks/tasks.repository.js';
import { createTaskService } from './modules/tasks/tasks.service.js';

/** Composition root: satu-satunya tempat yang merangkai repository -> service -> controller. */
export function createContainer(db) {
  const sessionRepository = createSessionRepository(db);
  const taskRepository = createTaskRepository(db);
  const alarmRepository = createAlarmRepository(db);
  const settingsRepository = createSettingsRepository(db);

  return {
    sessions: createSessionController(createSessionService({ sessionRepository })),
    tasks: createTaskController(createTaskService({ taskRepository })),
    alarms: createAlarmController(createAlarmService({ alarmRepository })),
    settings: createSettingsController(createSettingsService({ settingsRepository })),
    dashboard: createDashboardController(createDashboardService({ sessionRepository, taskRepository })),
  };
}
