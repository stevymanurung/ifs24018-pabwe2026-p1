# Deployment, Jenkins, dan Artefak

## 1. Menjalankan secara lokal (untuk video YouTube)

Urutan yang ditunjukkan di video (dimulai dari clone):

```bash
git clone https://github.com/<username>/ifs24018-pabwe2026-p1.git
cd ifs24018-pabwe2026-p1
npm run setup          # memasang dependensi root, server, dan client
npm run seed           # (opsional) data contoh
npm run dev            # API http://localhost:3001 dan web http://localhost:5173
```

Mode produksi lokal (satu URL): `npm run start:prod`, lalu buka http://localhost:3001.

Pengujian: `npm test` (server 63 tes, client 57 tes) dan `npm run lint`.

## 2. Docker

```bash
docker compose up -d --build
curl http://localhost:3001/api/health
```

Data SQLite disimpan pada volume `planner-data` (`/data/planner.db`) sehingga bertahan saat kontainer dibuat ulang.

## 3. Jenkins

1. Jalankan Jenkins (mis. `docker run -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock jenkins/jenkins:lts`)
   dan pastikan CLI Docker tersedia di agent.
2. Pasang plugin **NodeJS**, **JUnit**, **Pipeline**, **Git**.
3. *Manage Jenkins -> Tools -> NodeJS installations*: tambahkan instalasi bernama **`node-22`** (Node 22.x).
4. Buat job **Pipeline script from SCM** yang menunjuk ke repositori ini; script path: `Jenkinsfile`.
5. Jalankan *Build Now*. Tahapan: Install, Lint, Test (laporan JUnit), Build, Deploy (`docker compose up`), Smoke Test.
6. Tangkapan layar yang dikumpulkan: tampilan *Stage View* yang hijau dan halaman *Test Result*.

## 4. Deploy gratis ke Render (mode demo)

1. Push seluruh folder proyek ke repository GitHub. Pastikan `render.yaml`, `Dockerfile`, `client/`, dan `server/` ada di root repository.
2. Buka https://dashboard.render.com/ lalu pilih **New + -> Blueprint**.
3. Pilih repository tersebut. Render membaca `render.yaml` dan menyiapkan layanan Docker dengan paket Free.
4. Klik deploy dan tunggu status **Live**. Buka URL `onrender.com` yang diberikan.
5. Uji `https://<nama-layanan>.onrender.com/api/health`, lalu buka URL utama dan uji daftar/login/tugas.

### Batasan mode gratis (wajib dibaca)

`render.yaml` untuk mode gratis menyetel `DB_FILE=/tmp/planner.db`. Express + SQLite dapat menyimpan akun/tugas saat instance berjalan, tetapi `/tmp` bukan penyimpanan persisten. Data bisa hilang saat restart, redeploy, atau instance diganti; layanan Free juga dapat tidur saat tidak aktif. Jangan gunakan mode ini untuk menjanjikan data permanen.

### Jika data harus tetap ada setelah restart

Render memerlukan Persistent Disk yang tersedia pada paket berbayar. Untuk pilihan ini, salin isi `render-persistent.yaml` ke `render.yaml` sebelum membuat Blueprint, lalu pastikan disk terpasang pada `/data` dan `DB_FILE=/data/planner.db`. Jangan mengganti SQLite dengan database lain tanpa persetujuan dosen.

## 5. Daftar artefak

- [ ] Dokumen Proyek 1 (template)
- [ ] Repositori GitHub bernama `ifs24018-pabwe2026-p1`
- [ ] Hasil pengujian deployment Jenkins
- [ ] URL aplikasi online
- [ ] URL video YouTube


## Login dan akun

Aplikasi menampilkan halaman Login/Daftar sebelum membuka dashboard. Buat akun baru lewat tombol **Daftar sekarang**. Data akun dan token sesi disimpan di SQLite; password tidak disimpan sebagai teks biasa. Pastikan variabel `DB_FILE=/data/planner.db` dan Persistent Disk tetap terpasang di `/data` pada hosting Docker.
