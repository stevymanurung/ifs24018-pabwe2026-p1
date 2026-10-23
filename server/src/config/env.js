import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Konfigurasi aplikasi dibaca satu kali dari environment variable. */
export const config = Object.freeze({
  port: Number(process.env.PORT) || 3001,
  dbFile: process.env.DB_FILE || path.join(serverRoot, 'data', 'planner.db'),
  clientDist: process.env.CLIENT_DIST || path.resolve(serverRoot, '../client/dist'),
  corsOrigin: process.env.CORS_ORIGIN || '',
  seedDemo: process.env.SEED_DEMO === 'true',
  isTest: process.env.NODE_ENV === 'test',
});
