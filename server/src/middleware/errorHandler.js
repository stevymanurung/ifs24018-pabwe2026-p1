import { HttpError } from '../utils/httpError.js';

/** Semua route yang tidak dikenal di bawah /api menghasilkan JSON, bukan halaman HTML. */
export const apiNotFound = (req, _res, next) =>
  next(new HttpError(404, 'NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));

const body = (code, message, details) => ({ error: { code, message, ...(details ? { details } : {}) } });

/** Penanganan error terpusat: pesan aman untuk klien, rincian teknis hanya masuk log server. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(logger) {
  return (err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json(body(err.code, err.message, err.details));
    if (err.type === 'entity.parse.failed') return res.status(400).json(body('INVALID_JSON', 'Isi permintaan bukan JSON yang valid'));
    if (err.type === 'entity.too.large') return res.status(413).json(body('PAYLOAD_TOO_LARGE', 'Isi permintaan terlalu besar'));
    logger.error(err);
    return res.status(500).json(body('INTERNAL_ERROR', 'Terjadi kesalahan pada server'));
  };
}
