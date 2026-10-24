# Study Planner - Proyek 1 PABWE 2026

Aplikasi web untuk mengatur **jadwal pembelajaran**, **tugas**, dan **alarm pengingat**, dilengkapi **dashboard chart**.
Mata kuliah 11S3133 Pengembangan Aplikasi Berbasis Web.

| Bagian | Teknologi |
|---|---|
| Front-end | React 18, Vite, Tailwind CSS v4, React Router, Recharts |
| Back-end | Express.js, SQLite (better-sqlite3), Zod, Helmet |
| Pengujian | Vitest + Testing Library (client), `node:test` (server), ESLint |
| Deployment | Docker, Jenkins (`Jenkinsfile`) |

## Fitur

- **Sidebar kiri** (panel geser di ponsel) dengan lencana jumlah dan widget "Kuliah berikutnya"
- **Dashboard**: 4 kartu statistik, chart jam belajar per hari, status tugas (donat), tugas per mata kuliah
- **Jadwal** mingguan dengan validasi jam dan **deteksi bentrok** (kuliah berurutan boleh)
- **Tugas** dengan filter, penanda terlambat, dan pengingat pada jam tertentu di tanggal tenggat
- **Alarm** kustom, pengingat sebelum kuliah (5-30 menit), tunda 5 menit, bunyi + dialog + notifikasi browser
- Data tersimpan di **SQLite** melalui REST API sendiri

> Alarm hanya berbunyi selama halaman terbuka di browser (batasan platform web tanpa push server).

## Menjalankan

Prasyarat: **Node.js 20 atau lebih baru** (disarankan 22) dan Git.

```bash
git clone https://github.com/<username>/ifs24018-pabwe2026-p1.git
cd ifs24018-pabwe2026-p1
npm run setup        # memasang dependensi sesuai lockfile (root, server, client)
npm run seed         # (opsional) mengisi data contoh
npm run dev          # API: http://localhost:3001  |  Web: http://localhost:5173
```

Mode produksi (satu URL, Express menyajikan hasil build React):

```bash
npm run start:prod   # build front-end lalu jalankan server di http://localhost:3001
```

Docker: `docker compose up -d --build` lalu buka http://localhost:3001. Untuk menghentikan: `docker compose down`.

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server API + Vite dev server bersamaan |
| `npm run build` | Build front-end ke `client/dist` |
| `npm test` | Seluruh tes server dan client |
| `npm run lint` | ESLint untuk client |
| `npm run test:ci` | Tes dengan laporan JUnit (dipakai Jenkins) |
| `npm run test:v1` | Tes pembanding terhadap draf awal AI (bukti proses; memang menunjukkan kegagalan draf awal) |

Konfigurasi server lewat environment variable: lihat `server/.env.example`.

## Struktur proyek

```
ifs24018-pabwe2026-p1/
├── client/                      React + Vite + Tailwind
│   └── src/
│       ├── app/                 daftar rute, halaman 404
│       ├── components/{layout,ui}/   kerangka halaman dan komponen dasar
│       ├── features/            dashboard, schedule, tasks, reminders (halaman, komponen, hook per fitur)
│       ├── context/ hooks/      state bersama dan hook reusable
│       ├── services/            klien HTTP dan API per sumber daya
│       └── lib/                 fungsi murni tanpa React
├── server/                      Express + SQLite
│   └── src/
│       ├── modules/             sessions, tasks, alarms, settings, dashboard
│       │                        (routes -> controller -> service -> repository + schema)
│       ├── domain/              logika murni (waktu, bentrok, status, dashboard)
│       ├── db/ middleware/ config/ utils/
│       └── container.js app.js index.js
├── docs/                        api.md, architecture.md, deployment.md
├── Dockerfile  docker-compose.yml  Jenkinsfile
```

Penjelasan lapisan dan keputusan arsitektur: [docs/architecture.md](docs/architecture.md).
Daftar endpoint: [docs/api.md](docs/api.md). Deployment, Jenkins, dan URL online: [docs/deployment.md](docs/deployment.md).

## Kualitas kode

- **Separation of concerns**: server berlapis (route, controller, service, repository, domain murni); front-end memisahkan
  halaman, komponen tampilan, hook, service API, dan fungsi murni. Komponen tidak pernah memanggil `fetch` langsung.
- **Clean code**: komponen kecil satu tanggung jawab, tanpa duplikasi (`useSubmit`, `useFormFields`, `useCollection`),
  komentar menjelaskan *mengapa*, bukan *apa*.
- **Best practice**: validasi input di server (Zod) dan pesan error yang ramah di UI, error handler terpusat tanpa
  membocorkan stack trace, query SQL berparameter (aman dari SQL injection), Helmet, batas ukuran body, React Error Boundary,
  code splitting, aksesibilitas (label, `aria-*`, `<dialog>`), dan penutupan server yang rapi.
- **Teruji**: lihat `npm test`; bug nyata yang ditemukan dan diperbaiki selama pengembangan tercatat di riwayat commit.


## Akun pengguna

Pada kunjungan pertama, pilih **Daftar sekarang** untuk membuat akun. Gunakan email yang valid dan password minimal 8 karakter. Setelah berhasil daftar, aplikasi otomatis login. Akun berikutnya menggunakan halaman Login. Setiap akun memiliki jadwal, tugas, alarm, dan pengaturan sendiri.

API autentikasi tersedia di `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, dan `/api/auth/logout`. Password disimpan sebagai hash `scrypt`, sedangkan token sesi disimpan sebagai hash di SQLite.


## Catatan deployment Render gratis

ZIP ini memakai `render.yaml` untuk mode demo gratis dengan `DB_FILE=/tmp/planner.db`. API Express menyimpan data nyata ke SQLite selama instance aktif, bukan data dummy; tetapi penyimpanan `/tmp` tidak persisten dan data dapat hilang saat restart/redeploy. Jika syarat proyek mewajibkan data tetap ada setelah restart, gunakan `render-persistent.yaml` sebagai `render.yaml` dan layanan dengan Persistent Disk. Lihat `docs/deployment.md`.
