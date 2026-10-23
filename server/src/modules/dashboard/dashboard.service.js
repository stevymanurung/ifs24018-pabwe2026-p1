import { buildDashboard } from '../../domain/dashboard.js';
import { parseLocalNow } from '../../domain/time.js';
export function createDashboardService({ sessionRepository, taskRepository }) {
  return {
    build(nowText, userId = 1) {
      const now = nowText ? parseLocalNow(nowText) : new Date();
      return buildDashboard({ sessions: sessionRepository.findAll(userId), tasks: taskRepository.findAll(userId), now });
    },
  };
}
