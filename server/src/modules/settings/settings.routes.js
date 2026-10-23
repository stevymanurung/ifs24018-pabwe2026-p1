import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { updateSettingsSchema } from './settings.schema.js';

export function createSettingsRoutes(controller) {
  const router = Router();
  router.get('/', controller.get);
  router.put('/', validate(updateSettingsSchema), controller.update);
  return router;
}
