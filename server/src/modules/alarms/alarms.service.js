import { notFound } from '../../utils/httpError.js';

export function createAlarmService({ alarmRepository }) {
  return {
    list: (userId = 1) => alarmRepository.findAll(userId),
    create: (input, userId = 1) => alarmRepository.create(input, userId),

    setEnabled(id, enabled, userId = 1) {
      const alarm = alarmRepository.setEnabled(id, enabled, userId);
      if (!alarm) throw notFound('Alarm tidak ditemukan');
      return alarm;
    },

    remove(id, userId = 1) {
      if (!alarmRepository.remove(id, userId)) throw notFound('Alarm tidak ditemukan');
    },
  };
}
