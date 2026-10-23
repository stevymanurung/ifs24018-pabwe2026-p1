// Menjalankan rangkaian tes API yang SAMA terhadap draf awal AI (versi 1) sebagai bukti proses.
// Draf disimpan sebagai berkas .txt agar tidak dianggap bagian dari kode sumber proyek; runner ini
// membuat salinan .js sementara (folder .generated/, diabaikan git) lalu mengujinya.
import { mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const here = import.meta.dirname;
const generatedDir = path.join(here, '.generated');
const generatedApp = path.join(generatedDir, 'app.js');

mkdirSync(generatedDir, { recursive: true });
copyFileSync(path.join(here, 'v1-ai-draft', 'app.js.txt'), generatedApp);
process.env.APP_MODULE = pathToFileURL(generatedApp).href;

for (const file of ['sessions', 'tasks', 'alarms-settings', 'dashboard', 'errors']) {
  await import(`../test/api/${file}.api.test.js`);
}
