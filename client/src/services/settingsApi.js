import { http } from './httpClient.js';

export const settingsApi = {
  get: (signal) => http.get('/settings', { signal }),
  update: (patch) => http.put('/settings', patch),
};
