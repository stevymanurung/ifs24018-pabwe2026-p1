import { http } from './httpClient.js';

export const alarmsApi = {
  list: (signal) => http.get('/alarms', { signal }),
  create: (input) => http.post('/alarms', input),
  update: (id, patch) => http.patch(`/alarms/${id}`, patch),
  remove: (id) => http.delete(`/alarms/${id}`),
};
