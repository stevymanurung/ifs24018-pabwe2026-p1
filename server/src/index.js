import { config } from './config/env.js';
import { openDatabase } from './db/connection.js';
import { seedDemoData } from './db/seed.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

const db = openDatabase(config.dbFile);
if (config.seedDemo && seedDemoData(db)) logger.info('Data contoh dimasukkan (SEED_DEMO=true).');

const server = createApp({ db }).listen(config.port, () => {
  logger.info(`Study Planner API berjalan di http://localhost:${config.port}`);
});

// Penutupan yang rapi: berhenti menerima koneksi, lalu tutup database.
function shutdown(signal) {
  logger.info(`${signal} diterima, menutup server...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
