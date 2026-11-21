# Konsol administrator Postter

Implementasi berada pada `/admin` dengan halaman Dashboard, Users, Content, Ads, Moderation, Analytics, Settings, Logs, dan Profile. Angka berasal dari database aplikasi. Data kosong ditampilkan sebagai kosong; tidak ada angka contoh atau persentase pertumbuhan buatan.

## Hak akses dan tindakan

- Administrator: mengelola pengguna, role, verifikasi, konten, laporan, kampanye, konfigurasi, log, dan sesi.
- Moderator: melihat konten/laporan, mengedit teks konten, memindahkan konten ke sampah, memulihkan, dan meninjau laporan. Tidak dapat mengatur pengguna, verifikasi, iklan, konfigurasi, atau menghapus permanen.
- Pergantian role mencabut token lama. Administrator tidak dapat mengganti role sendiri; administrator terakhir tidak dapat diturunkan melalui editor.
- Verifikasi admin tetap hanya mengubah status verifikasi, terpisah dari paket langganan dan batas upload.
- Delete User memakai alur penonaktifan akun yang sudah ada. Ini berbeda dari penghapusan permanen konten.
- Move to Trash menyembunyikan konten, sementara Restore mengembalikannya. Delete Permanently hanya menerima konten dalam sampah, alasan, dan konfirmasi `DELETE`; data konten dan relasinya dihapus dari database, dengan jejak audit tetap disimpan. Berkas upload fisik belum dibersihkan otomatis karena dapat digunakan oleh konten lain.
- Edit User menyediakan informasi profil, foto/banner, role, dan kewajiban 2FA untuk akun yang sudah mendaftarkan authenticator. Username tetap hanya baca.
- Log mencatat tindakan berhasil, target, waktu, dan IP bila tersedia; isi pesan pribadi dan password tidak dicatat. IP login hanya tersedia untuk sesi yang dibuat/dicatat setelah pembaruan.

## 2FA dan notifikasi

Pengguna mendaftarkan secret pada authenticator TOTP melalui Settings atau Admin Profile, lalu mengonfirmasi kode. Login memerlukan password dan kode ketika 2FA aktif. Login OAuth untuk akun tersebut diarahkan ke login password + kode. Kode tidak dapat digunakan ulang. Tidak ada kode pemulihan otomatis; simpan akses authenticator sebelum mengaktifkan 2FA wajib untuk semua admin.

Secret 2FA dan private key Web Push dienkripsi dengan kunci yang diturunkan dari `JWT_SECRET` yang sudah diwajibkan aplikasi. Pertahankan secret server tersebut ketika deploy. Menggantinya membuat secret tersimpan tidak dapat dibaca dan token lama tidak berlaku.

Email notifikasi membutuhkan konfigurasi SMTP yang sudah dipakai aplikasi (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`), sakelar platform, persetujuan pengguna, dan email terverifikasi. Worker outbox berjalan di proses backend; percobaan gagal dijadwalkan ulang dengan batas percobaan. Endpoint provider push dibatasi dan respons 404/410 membuang subscription kedaluwarsa. Web Push membutuhkan HTTPS, sakelar platform, dukungan browser, dan izin pada setiap perangkat. Kunci VAPID dibuat dan disimpan terenkripsi pada database saat pertama diperlukan. Izin browser tidak diminta otomatis.

## Iklan, analitik, dan konfigurasi

Kampanye memiliki gambar, tujuan HTTP/HTTPS, penempatan (`top_banner`, `feed`, `sidebar`, `profile`, `explore`), status aktif/jeda, dan jadwal mulai/akhir UTC. Hanya kampanye aktif dalam jadwal tampil. Tayangan dicatat setelah iklan terlihat; klik menggunakan redirect server. CTR dihitung dari klik dan tayangan yang benar-benar tercatat.

Grafik menyediakan periode 7/30/90/365 hari. Kartu total pengguna/konten/view adalah total data yang tersedia; trafik dan klik periode mengikuti pilihan tanggal. Statistik adalah hitungan kejadian, bukan pengunjung unik. Query pencarian, identitas pengunjung, dan isi pesan tidak dikirim ke analitik. Trafik sebelum fitur diaktifkan tidak dapat direkonstruksi, dan belum ada penyaringan bot khusus.

Settings mengatur brand, bahasa awal, zona waktu tampilan tanggal admin, feed awal, jumlah item, registrasi, verifikasi email, batas upload, maintenance, guest posting, notifikasi, dan analitik. Guest posting hanya teks, nonaktif secara default, dan masuk sampah moderasi terlebih dahulu. Maintenance tetap mengizinkan admin mengelola konfigurasi. Batas sesi tetap mengikuti kebijakan tidak aktif 12 jam yang sudah ada.

## Pembaruan instalasi yang sudah berjalan

1. Backup database, upload, konfigurasi, dan binary yang sedang dipakai.
2. Build frontend baru (`npm ci`, `npm run build` dalam `frontend`) dan backend baru (`go build`; target Linux amd64 untuk EC2 yang ada).
3. Perbarui binary dan seluruh `frontend/dist` sebagai satu versi. Pertahankan `.env`, upload, serta `JWT_SECRET` server. Jangan gunakan installer instalasi awal untuk menimpa server yang sudah berjalan.
4. Restart service backend sesuai instalasi. Startup menjalankan AutoMigrate untuk model baru/kolom baru, termasuk role Moderator, kampanye, trafik, 2FA, outbox, dan push subscription. Verifikasi log startup dan `/api/v1/health/ready`.
5. Muat ulang browser, login admin, periksa setiap menu, lalu uji pengaturan dengan perubahan yang dapat dipulihkan. Daftarkan 2FA setiap admin sebelum menyalakan kewajiban 2FA global.
6. Untuk Web Push, pastikan `/push-sw.js` diteruskan Nginx ke backend, bukan fallback HTML SPA. Uji email ke alamat pengujian sendiri dan izin push pada perangkat pengujian sebelum mengaktifkan ke semua pengguna.

Pekerjaan source ini tidak melakukan deploy AWS atau migrasi database aplikasi lokal. Pemeriksaan tampilan memakai data publik aplikasi pada harness baca saja; harness dibuang setelah pemeriksaan. Integrasi database diuji pada database MySQL sementara terpisah, termasuk transaksi outbox, hak role, dan hapus permanen. Pengiriman ke provider SMTP/push sungguhan belum diuji.
