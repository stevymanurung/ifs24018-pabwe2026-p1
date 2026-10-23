# Deploy Study Planner ke Render (Express + SQLite)

Konfigurasi ini mempertahankan stack proyek sesuai modul: React/Vite untuk frontend, Express.js untuk backend API, dan SQLite untuk database. Jangan deploy backend sebagai Vercel Function jika data harus bertahan: file SQLite lokal tidak cocok untuk filesystem serverless yang sementara.

## 1. Uji dan jalankan di komputer

Prasyarat: Node.js 22 LTS, npm, Git. Di Windows PowerShell, buka folder root hasil ekstrak ZIP.

```powershell
npm run setup
npm run lint
npm test
npm run build
npm run seed   # opsional, hanya data demo
npm run start:prod
```

Buka `http://localhost:3001`. Periksa `http://localhost:3001/api/health`. `start:prod` membangun frontend lalu menjalankan Express yang melayani frontend dan `/api` dari satu origin.

Untuk mode pengembangan dua terminal sekaligus, gunakan `npm run dev`; frontend biasanya `http://localhost:5173` dan API `http://localhost:3001`.

## 2. Push ke GitHub

Pastikan seluruh perubahan sudah masuk ke repository GitHub yang akan di-deploy. Jangan commit `.env`, database lokal, atau `node_modules`.

## 3. Deploy di Render

1. Login ke Render dan pilih **New → Blueprint**.
2. Hubungkan repository GitHub proyek ini dan pilih branch yang benar.
3. Render membaca `render.yaml`. Periksa bahwa service memakai Dockerfile di root dan Persistent Disk dipasang pada `/data`.
4. Persistent Disk diperlukan supaya file `/data/planner.db` tidak hilang saat redeploy/restart. Disk membutuhkan paket Render berbayar yang mendukung disk; jangan menghapus disk setelah data produksi dibuat.
5. Jalankan deploy dan tunggu status **Live**.
6. Buka `https://NAMA-SERVICE.onrender.com/api/health`. Respons yang diharapkan memuat `"status":"ok"`.
7. Buka `https://NAMA-SERVICE.onrender.com/`, lalu coba tambah, ubah, dan hapus data. Setelah redeploy, periksa data tetap ada.

`SEED_DEMO=false` dipakai untuk mencegah data contoh dimasukkan otomatis. Jika membutuhkan data demo, ubah menjadi `true` hanya sesuai kebutuhan dan ingat seed hanya memasukkan data bila database masih kosong.

## 4. Jika deploy gagal

- Buka halaman service → **Logs**, lihat error pertama saat build/start.
- Pastikan Dockerfile, `render.yaml`, folder `client`, dan folder `server` ada di root repository.
- Pastikan health check `/api/health` merespons 200.
- Jangan mengganti `DB_FILE=/data/planner.db` atau mount disk `/data` tanpa menyesuaikan keduanya.
- Jangan anggap deployment sukses hanya karena build selesai; tes URL halaman utama, endpoint health, fitur CRUD, dan persistensi setelah restart.

## 5. Jenkins

`Jenkinsfile` dalam proyek ini mengasumsikan agent Linux dengan NodeJS tool bernama `node-22`, plugin JUnit, Docker, Docker Compose, dan akses ke daemon Docker. Jika Jenkins agent tidak memiliki Docker, tahap Deploy/Smoke Test akan gagal walaupun test aplikasi lolos. Konfigurasikan NodeJS tool dengan nama persis `node-22` atau sesuaikan nama tool di `Jenkinsfile`.
