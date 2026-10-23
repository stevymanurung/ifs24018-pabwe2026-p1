# Dokumentasi API

Basis URL: `/api`. Semua isi permintaan dan respons berformat JSON.

## Format error

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Judul tugas tidak boleh kosong", "details": [{ "field": "title", "message": "..." }] } }
```

| Kode | Status | Arti |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Input tidak valid (`details` memuat kesalahan per field) |
| `INVALID_JSON` | 400 | Isi permintaan bukan JSON yang valid |
| `NOT_FOUND` | 404 | Data atau endpoint tidak ditemukan |
| `SESSION_CONFLICT` | 409 | Sesi jadwal bentrok dengan sesi lain |
| `PAYLOAD_TOO_LARGE` | 413 | Isi permintaan melebihi 10 KB |
| `INTERNAL_ERROR` | 500 | Kesalahan server (rincian hanya ada di log server) |

## Endpoint

| Metode | Path | Keterangan |
|---|---|---|
| GET | `/health` | Pemeriksaan kesehatan: `{ "status": "ok" }` |
| GET | `/sessions` | Daftar sesi, urut hari lalu jam mulai |
| POST | `/sessions` | Tambah sesi `{ course, day (0=Senin..6), start, end, room? }`; 201, 400, atau 409 |
| DELETE | `/sessions/:id` | Hapus sesi; 204 atau 404 |
| GET | `/tasks?status=all\|active\|done` | Daftar tugas |
| POST | `/tasks` | Tambah tugas `{ title, course?, dueDate? (YYYY-MM-DD), remindAt? (HH:MM, butuh dueDate) }` |
| PATCH | `/tasks/:id` | Ubah status `{ done: boolean }` |
| DELETE | `/tasks/:id` | Hapus tugas |
| GET | `/alarms` | Daftar alarm |
| POST | `/alarms` | Tambah alarm `{ label?, time, days: [0..6] }` |
| PATCH | `/alarms/:id` | Aktif/nonaktif `{ enabled: boolean }` |
| DELETE | `/alarms/:id` | Hapus alarm |
| GET | `/settings` | `{ reminderLead }` (menit sebelum kuliah) |
| PUT | `/settings` | `{ reminderLead }`, salah satu dari 0, 5, 10, 15, 30 |
| GET | `/dashboard?now=YYYY-MM-DDTHH:mm` | Data dashboard dihitung server |

`now` adalah waktu **lokal pengguna**. Server di zona waktu mana pun akan menghitung "hari ini", "terlambat",
dan "kuliah berikutnya" sesuai hari pengguna.

Jam diterima dengan atau tanpa nol di depan (`9:00` atau `09:00`) dan disimpan dalam bentuk baku `HH:MM`.
