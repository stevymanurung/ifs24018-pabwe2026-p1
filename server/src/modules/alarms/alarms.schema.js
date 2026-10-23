import { z } from 'zod';
import { timeField } from '../sessions/sessions.schema.js';

const daysField = z
  .array(z.number().int('Hari tidak valid').min(0, 'Hari tidak valid').max(6, 'Hari tidak valid'), {
    required_error: 'Pilih minimal satu hari',
    invalid_type_error: 'Hari harus berupa daftar angka',
  })
  .min(1, 'Pilih minimal satu hari')
  .transform((days) => [...new Set(days)].sort((a, b) => a - b));

export const createAlarmSchema = z.object({
  label: z.string().trim().max(40, 'Nama alarm maksimal 40 karakter').optional().default('').transform((v) => v || 'Alarm'),
  time: timeField,
  days: daysField,
});

export const updateAlarmSchema = z.object({
  enabled: z.boolean({ required_error: 'Status aktif wajib diisi', invalid_type_error: 'Status aktif harus true atau false' }),
});
