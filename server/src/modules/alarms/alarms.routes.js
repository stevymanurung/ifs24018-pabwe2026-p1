import { Router } from 'express';
import { parseId, validate } from '../../middleware/validate.js';
import { createAlarmSchema, updateAlarmSchema } from './alarms.schema.js';

export function createAlarmRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validate(createAlarmSchema), controller.create);
  router.patch('/:id', parseId, validate(updateAlarmSchema), controller.update);
  router.delete('/:id', parseId, controller.remove);
  return router;
}
