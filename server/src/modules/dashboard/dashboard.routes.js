import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { dashboardQuerySchema } from './dashboard.schema.js';

export function createDashboardRoutes(controller) {
  const router = Router();
  router.get('/', validate(dashboardQuerySchema, 'query'), controller.get);
  return router;
}
