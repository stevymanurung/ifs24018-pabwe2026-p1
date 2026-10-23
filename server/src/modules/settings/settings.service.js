import { DEFAULT_REMINDER_LEAD } from './settings.schema.js';

export function createSettingsService({ settingsRepository }) {
  const read = () => ({ reminderLead: Number(settingsRepository.get('reminderLead') ?? DEFAULT_REMINDER_LEAD) });

  return {
    get: read,
    update({ reminderLead }) {
      settingsRepository.set('reminderLead', reminderLead);
      return read();
    },
  };
}
