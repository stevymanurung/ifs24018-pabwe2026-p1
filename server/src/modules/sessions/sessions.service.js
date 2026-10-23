import { findConflict, sortSessions } from '../../domain/sessions.js';
import { conflict, notFound } from '../../utils/httpError.js';

/** Aturan bisnis sesi jadwal; tidak mengenal HTTP maupun SQL. */
export function createSessionService({ sessionRepository }) {
  return {
    list: (userId = 1) => sortSessions(sessionRepository.findAll(userId)),

    create(input, userId = 1) {
      const clash = findConflict(sessionRepository.findAll(userId), input);
      if (clash) {
        throw conflict('SESSION_CONFLICT', `Bentrok dengan "${clash.course}" (${clash.start} - ${clash.end})`);
      }
      return sessionRepository.create(input, userId);
    },

    remove(id, userId = 1) {
      if (!sessionRepository.remove(id, userId)) throw notFound('Sesi tidak ditemukan');
    },
  };
}
