# Arsitektur

```
Browser (React) --HTTP /api--> Express --> SQLite (better-sqlite3)
```

## Back-end (`server/src`)

Berlapis; setiap lapisan hanya mengenal lapisan di bawahnya.

| Lapisan | Berkas | Tanggung jawab |
|---|---|---|
| Route | `modules/*/*.routes.js` | Memasang path, validasi (`validate`, `parseId`) |
| Controller | `modules/*/*.controller.js` | Menerjemahkan HTTP ke pemanggilan service |
| Service | `modules/*/*.service.js` | Aturan bisnis (mis. deteksi bentrok), melempar `HttpError` |
| Repository | `modules/*/*.repository.js` | Satu-satunya tempat SQL; seluruh query berparameter |
| Domain | `domain/*.js` | Fungsi murni (waktu, bentrok, status tugas, dashboard); tanpa HTTP/SQL |
| Validasi | `modules/*/*.schema.js` | Skema Zod; menormalkan data (jam `9:00` menjadi `09:00`) |
| Komposisi | `container.js`, `routes.js`, `app.js` | Merangkai dependensi (`createApp({ db })` memudahkan pengujian) |
| Lintas bidang | `middleware/` | Error handler terpusat, 404 JSON, CORS opsional |

## Front-end (`client/src`)

Struktur per fitur (feature-based); halaman dimuat malas (code splitting).

| Folder | Isi |
|---|---|
| `app/` | Daftar rute (sumber kebenaran navigasi), halaman 404 |
| `components/layout/` | `AppLayout`, `Sidebar` (kiri), `Topbar`, `NextClassCard` |
| `components/ui/` | Komponen dasar bersama: `Button`, `Card`, `TextField`, `SelectField`, `FormError`, dst. |
| `features/dashboard/` | Halaman dashboard + chart Recharts (`HoursChart`, `StatusChart`, `CourseChart`) |
| `features/schedule/` | Halaman jadwal, formulir, kolom hari |
| `features/tasks/` | Halaman tugas, formulir, filter, daftar |
| `features/reminders/` | Halaman alarm, `engine.js` (murni), hook mesin, bunyi, notifikasi, dialog dering |
| `context/` + `hooks/` | `PlannerProvider` (satu tempat memuat data), `useCollection`, `useSubmit`, `useFormFields`, dst. |
| `services/` | Klien HTTP + satu berkas API per sumber daya; satu-satunya tempat `fetch` |
| `lib/` | Fungsi murni tanpa React (waktu, filter tugas, pengelompokan jadwal) |

Alur data: komponen -> hook -> service API -> Express. Komponen tidak memanggil `fetch` secara langsung.

## Keputusan penting

- **Server sebagai sumber kebenaran**: setelah setiap perubahan, klien memuat ulang daftar dari server (tanpa cache ganda).
- **Dashboard dihitung server** dari data sendiri dan menerima waktu lokal pengguna lewat `?now=`.
- **Mesin alarm di front-end** karena butuh timer dan bunyi browser; logikanya murni (`engine.js`) sehingga teruji.
  Status "sudah berbunyi" disimpan per perangkat di `localStorage`.
- **Satu URL di produksi**: Express menyajikan hasil build React dan fallback SPA.
