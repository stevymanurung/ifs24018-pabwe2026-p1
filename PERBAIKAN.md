# Catatan Perbaikan Proyek 1 PABWE

## Perubahan

- Skrip `npm run setup` memakai `npm ci` untuk root, server, dan client agar instalasi mengikuti lockfile.
- Pipeline Jenkins membuat folder laporan JUnit untuk backend dan frontend sebelum tes dijalankan.
- Penyimpanan status pengingat menangani kegagalan akses `localStorage`, termasuk saat browser membatasi akses penyimpanan.
- Ditambahkan tes untuk memastikan kegagalan baca penyimpanan tidak menjatuhkan aplikasi.
- README diperbarui untuk menjelaskan setup berbasis lockfile dan perintah penghentian Docker.

## Menjalankan secara lokal

Prasyarat: Node.js 22 LTS atau versi 20+ yang kompatibel, serta npm.

```bash
npm run setup
npm run seed
npm run dev
```

Buka alamat frontend yang muncul di terminal (umumnya `http://localhost:5173`). API berjalan pada `http://localhost:3001`.

Pemeriksaan sebelum commit:

```bash
npm run lint
npm test
npm run build
```

`npm run seed` opsional dan hanya memasukkan data contoh saat database masih kosong.


## Login dan database pengguna (revisi)

- Halaman awal sekarang meminta pengguna **Login** atau **Daftar akun**.
- Endpoint autentikasi: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- Akun disimpan pada tabel SQLite `users`; password diproses menggunakan `scrypt` dan tidak disimpan sebagai teks biasa.
- Token sesi acak disimpan dalam bentuk hash di tabel `auth_sessions` dan berlaku 7 hari.
- Endpoint jadwal, tugas, alarm, pengaturan, dan dashboard membutuhkan Bearer token serta membatasi query berdasarkan `user_id`.
- Setelah mengunduh versi ini, jalankan `npm run setup`, `npm test`, `npm run lint`, dan `npm run build` sebelum deploy. Untuk deployment Docker/Render, pertahankan disk persisten di `/data` agar database SQLite tidak hilang.
