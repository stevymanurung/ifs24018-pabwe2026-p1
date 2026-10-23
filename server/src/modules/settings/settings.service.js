import { DEFAULT_REMINDER_LEAD } from './settings.schema.js';

export function createSettingsService({ settingsRepository }) {
  const read = (userId = 1) => ({ reminderLead: Number(settingsRepository.get('reminderLead', userId) ?? DEFAULT_REMINDER_LEAD) });

  return {
    get: read,
    update({ reminderLead }, userId = 1) {
      settingsRepository.set('reminderLead', reminderLead, userId);
      return read(userId);
    },
  };
}
