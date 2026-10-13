# Menjalankan aplikasi lokal di Windows

Aktifkan MySQL di Laragon, kemudian jalankan dari folder proyek:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

Buka http://localhost:3000. Backend menyajikan hasil build React sehingga tidak perlu menjalankan server frontend terpisah. Gunakan halaman `/register` untuk membuat akun.

Script memakai Go portable di `tmp/toolchain/go` bila tersedia, atau Go dari PATH. Cache Go disimpan di `tmp`. Konfigurasi koneksi MySQL dan secret berada di `.env` yang diabaikan Git. Database `medsos` sudah disiapkan; tabel dibuat otomatis oleh aplikasi saat startup. Untuk database baru, buat databasenya terlebih dahulu karena queue Goravel membuka koneksi saat bootstrap.

Jika server hasil setup masih berjalan di latar belakang, hentikan sebelum menjalankan ulang:

```powershell
powershell -ExecutionPolicy Bypass -File .\stop-local.ps1
```

Log server latar belakang tersimpan di `tmp/backend.stdout.log` dan `tmp/backend.stderr.log`.

Setelah mengubah frontend, rebuild dengan:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1 -BuildFrontend
```

Untuk pengembangan dengan pembaruan frontend otomatis, biarkan backend berjalan lalu buka terminal kedua:

```powershell
cd frontend
npm run dev
```

Buka http://localhost:5173. Vite meneruskan `/api`, `/uploads`, dan `/web` ke backend port 3000. Hentikan proses terminal dengan Ctrl+C.

Upload dan pemrosesan video memakai `ffprobe.exe` serta `ffmpeg.exe` portable di `tmp/toolchain/ffmpeg/bin`. Backend mencari folder tersebut otomatis; `start-local.ps1` juga menambahkannya ke PATH proses. Untuk instalasi lain, gunakan PATH atau variabel `FFPROBE_PATH` / `FFMPEG_PATH`. Email SMTP dan login OAuth memerlukan konfigurasi layanan tersendiri apabila fitur tersebut digunakan.

Sesi login otomatis berakhir setelah 30 menit tanpa aktivitas. Frontend menampilkan peringatan 1 menit sebelumnya dan menyinkronkan aktivitas antar-tab. Backend memeriksa `login_sessions.last_activity` saat memvalidasi access maupun refresh token; background polling tidak memperpanjang sesi. Logout mengakhiri sesi browser tersebut tanpa mengeluarkan perangkat lain.
