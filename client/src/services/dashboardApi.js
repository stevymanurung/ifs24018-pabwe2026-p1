import { http } from './httpClient.js';

export const dashboardApi = {
  /** `nowText` = waktu lokal pengguna (YYYY-MM-DDTHH:mm). */
  get: (nowText, signal) => http.get(`/dashboard?now=${encodeURIComponent(nowText)}`, { signal }),
};
