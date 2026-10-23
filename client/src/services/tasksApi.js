import { http } from './httpClient.js';

export const tasksApi = {
  list: (signal) => http.get('/tasks', { signal }),
  create: (input) => http.post('/tasks', input),
  update: (id, patch) => http.patch(`/tasks/${id}`, patch),
  remove: (id) => http.delete(`/tasks/${id}`),
};
