import { http } from './httpClient.js';

export const sessionsApi = {
  list: (signal) => http.get('/sessions', { signal }),
  create: (input) => http.post('/sessions', input),
  remove: (id) => http.delete(`/sessions/${id}`),
};
