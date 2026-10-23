import { Router } from 'express';
import { parseId, validate } from '../../middleware/validate.js';
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from './tasks.schema.js';

export function createTaskRoutes(controller) {
  const router = Router();
  router.get('/', validate(listTasksQuerySchema, 'query'), controller.list);
  router.post('/', validate(createTaskSchema), controller.create);
  router.patch('/:id', parseId, validate(updateTaskSchema), controller.update);
  router.delete('/:id', parseId, controller.remove);
  return router;
}
