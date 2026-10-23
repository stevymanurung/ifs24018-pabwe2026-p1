import { z } from 'zod';
import { normalizeTime, toMinutes } from '../../domain/time.js';

export const timeField = z
  .string({ required_error: 'Jam wajib diisi', invalid_type_error: 'Jam tidak valid' })
  .trim()
  .refine((value) => !Number.isNaN(toMinutes(value)), 'Format jam tidak valid (gunakan HH:MM)')
  .transform(normalizeTime);

export const createSessionSchema = z
  .object({
    course: z
      .string({ required_error: 'Nama mata kuliah/kegiatan tidak boleh kosong' })
      .trim()
      .min(1, 'Nama mata kuliah/kegiatan tidak boleh kosong')
      .max(60, 'Nama maksimal 60 karakter'),
    day: z.number({ invalid_type_error: 'Hari tidak valid', required_error: 'Hari wajib diisi' }).int('Hari tidak valid').min(0, 'Hari tidak valid').max(6, 'Hari tidak valid'),
    start: timeField,
    end: timeField,
    room: z.string().trim().max(30, 'Ruang maksimal 30 karakter').optional().default(''),
  })
  .refine((data) => toMinutes(data.end) > toMinutes(data.start), {
    message: 'Jam selesai harus setelah jam mulai',
    path: ['end'],
  });
