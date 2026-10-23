import { buildDashboard } from '../../domain/dashboard.js';
import { parseLocalNow } from '../../domain/time.js';

export function createDashboardService({ sessionRepository, taskRepository }) {
  return {
    build(nowText) {
      const now = nowText ? parseLocalNow(nowText) : new Date();
      return buildDashboard({ sessions: sessionRepository.findAll(), tasks: taskRepository.findAll(), now });
    },
  };
}
