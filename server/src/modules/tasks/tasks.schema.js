import { z } from 'zod';
import { isValidDateString } from '../../domain/time.js';
import { timeField } from '../sessions/sessions.schema.js';

const dateField = z
  .string()
  .trim()
  .refine((value) => value === '' || isValidDateString(value), 'Format tanggal tidak valid (YYYY-MM-DD)');

export const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: 'Judul tugas tidak boleh kosong' })
      .trim()
      .min(1, 'Judul tugas tidak boleh kosong')
      .max(100, 'Judul maksimal 100 karakter'),
    course: z.string().trim().max(60, 'Mata kuliah maksimal 60 karakter').optional().default(''),
    dueDate: dateField.optional().default(''),
    remindAt: z.union([z.literal(''), timeField]).optional().default(''),
  })
  .refine((data) => data.remindAt === '' || data.dueDate !== '', {
    message: 'Pengingat tugas membutuhkan tanggal tenggat',
    path: ['remindAt'],
  });

export const updateTaskSchema = z.object({
  done: z.boolean({ required_error: 'Status selesai wajib diisi', invalid_type_error: 'Status selesai harus true atau false' }),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(['all', 'active', 'done'], { invalid_type_error: 'Status tidak valid' }).optional().default('all'),
});
