import { findConflict, sortSessions } from '../../domain/sessions.js';
import { conflict, notFound } from '../../utils/httpError.js';

/** Aturan bisnis sesi jadwal; tidak mengenal HTTP maupun SQL. */
export function createSessionService({ sessionRepository }) {
  return {
    list: () => sortSessions(sessionRepository.findAll()),

    create(input) {
      const clash = findConflict(sessionRepository.findAll(), input);
      if (clash) {
        throw conflict('SESSION_CONFLICT', `Bentrok dengan "${clash.course}" (${clash.start} - ${clash.end})`);
      }
      return sessionRepository.create(input);
    },

    remove(id) {
      if (!sessionRepository.remove(id)) throw notFound('Sesi tidak ditemukan');
    },
  };
}
