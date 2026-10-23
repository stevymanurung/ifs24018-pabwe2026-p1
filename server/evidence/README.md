# Bukti proses: draf awal dari AI

`v1-ai-draft/app.js.txt` adalah draf pertama back-end yang dihasilkan AI, disimpan apa adanya (satu berkas,
SQL digabung dengan string, tanpa validasi). Berkas ini sengaja berekstensi `.txt` agar tidak dianggap bagian
dari kode sumber proyek.

`npm run test:v1` menjalankan rangkaian tes API yang **sama** terhadap draf tersebut (hasil: 27 dari 34 tes gagal),
sedangkan `npm test` menguji implementasi akhir (semua lulus). Hasil mentahnya ada di `v1-output.txt`.
