import { notFound } from '../../utils/httpError.js';

export function createAlarmService({ alarmRepository }) {
  return {
    list: () => alarmRepository.findAll(),
    create: (input) => alarmRepository.create(input),

    setEnabled(id, enabled) {
      const alarm = alarmRepository.setEnabled(id, enabled);
      if (!alarm) throw notFound('Alarm tidak ditemukan');
      return alarm;
    },

    remove(id) {
      if (!alarmRepository.remove(id)) throw notFound('Alarm tidak ditemukan');
    },
  };
}
