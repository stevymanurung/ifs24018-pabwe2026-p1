import { z } from 'zod';

export const REMINDER_LEADS = [0, 5, 10, 15, 30];
export const DEFAULT_REMINDER_LEAD = 10;

export const updateSettingsSchema = z.object({
  reminderLead: z
    .number({ required_error: 'reminderLead wajib diisi', invalid_type_error: 'reminderLead harus berupa angka' })
    .refine((value) => REMINDER_LEADS.includes(value), `reminderLead harus salah satu dari ${REMINDER_LEADS.join(', ')}`),
});
