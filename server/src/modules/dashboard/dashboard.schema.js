import { z } from 'zod';
import { parseLocalNow } from '../../domain/time.js';

/** `now` = waktu LOKAL pengguna (YYYY-MM-DDTHH:mm) supaya server di zona waktu mana pun menghitung hari yang sama dengan pengguna. */
export const dashboardQuerySchema = z.object({
  now: z
    .string()
    .optional()
    .refine((value) => value === undefined || parseLocalNow(value) !== null, 'Parameter now harus berformat YYYY-MM-DDTHH:mm'),
});
