import { Router } from 'express';
import { parseId, validate } from '../../middleware/validate.js';
import { createSessionSchema } from './sessions.schema.js';

export function createSessionRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validate(createSessionSchema), controller.create);
  router.delete('/:id', parseId, controller.remove);
  return router;
}
