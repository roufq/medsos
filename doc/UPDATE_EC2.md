# Update Postter dari GitHub pada EC2 yang sudah aktif

Pengembangan tetap pada `ahmad`, server memakai branch lokal `production` di
`/opt/postter`. Alur berikut mengambil kode dari `origin/ahmad` tanpa mengganti
nama branch aktif server. Push perubahan yang sudah diuji dari laptop dahulu.
Perintah
berikut dijalankan di terminal AWS sebagai root (setelah `sudo -i`), bukan di
PowerShell Windows. Jangan menjalankan `install.sh` pada server yang sudah aktif.

Di laptop (PowerShell), dari `D:\www\medsos`, periksa branch aktif harus `ahmad`.
File `server.exe` adalah hasil build Windows yang masih dilacak repository;
perubahannya tidak dibutuhkan untuk rilis Linux ini.

```powershell
Set-Location D:\www\medsos
git status -sb
git add --all -- . ':!server.exe'
git diff --cached --stat
git commit -m "Update Postter interface, language, moderation and safe EC2 deployment"
git push origin ahmad
```

Push harus berhasil sebelum melanjutkan di AWS. Tidak perlu push database,
`.env`, upload, storage, atau hasil frontend/dist.

## 1. Periksa server dan ambil script pembaruan

```bash
cd /opt/postter
git status -sb
git fetch origin ahmad
update_script="$(mktemp /var/tmp/postter-update.XXXXXXXX.sh)"
git show origin/ahmad:deploy/ec2/update.sh > "$update_script"
```

Jika Git menolak karena ada perubahan atau riwayat bercabang, hentikan dan simpan
perubahan server pada branch hotfix. Jangan memakai `reset --hard` atau menghapus
`.env`, database, uploads, maupun storage.

## 2. Persiapan pertama untuk build di server

```bash
bash deploy/ec2/prepare-build-tools.sh
```

Script memasang compiler Go stabil dan Node 24 dari distribusi resmi. Checksum
SHA-256 diverifikasi sebelum ekstraksi, dan Go memeriksa kebutuhan `go.mod`.
Pada server dengan RAM kurang dari 3 GiB dan
tanpa swap, script menambahkan swap 2 GiB yang bertahan setelah reboot. Ini
memerlukan ruang disk; tidak membuat layanan AWS baru.

Sumber: https://go.dev/doc/toolchain dan https://nodejs.org/en/download

## 3. Build, backup, dan aktivasi

```bash
bash "$update_script" ahmad
```

Script menolak branch aktif selain `production`, working tree yang berubah,
commit server yang tidak ada di sumber, dan source yang melacak `.env`, uploads,
storage, binary Linux atau frontend/dist. Ia menjalankan fast-forward dari
`origin/ahmad`; tidak memakai reset atau menghapus data runtime. Jika rilis
nantinya berasal dari `origin/production`, berikan argumen `production`.
Build
dijalankan dari snapshot Git di `/var/tmp/postter-build.*`, sehingga hasil build
yang sedang dipakai tetap tersedia sampai build baru selesai. Build Go dibatasi
satu proses untuk mengurangi penggunaan RAM.

Setelah build selesai, aplikasi dihentikan sementara untuk mencadangkan database,
uploads/storage, `.env`, binary, frontend, dan resources ke direktori privat
`/var/backups/postter-update.*`. Database memakai nama `DB_DATABASE` yang dibaca
dari `.env`; konfigurasi instalasi ini memakai MySQL lokal dengan autentikasi
root melalui Unix socket.

Binary/frontend/resources diganti dan service diperiksa melalui endpoint readiness
backend dan HTTPS publik. Keduanya wajib menjawab HTTP 200 dengan JSON
`status: ready`; redirect 301 bukan keberhasilan. Jika aktivasi gagal, script mencoba memulihkan binary dan
frontend/resources sebelumnya. Database tidak dipulihkan otomatis; perubahan
schema saat startup perlu diperiksa sebelum melakukan pemulihan database.
Source Git tetap pada revisi baru jika runtime terpaksa dipulihkan.

Database pengguna dan konfigurasi runtime tidak diganti dengan data dari lokal.
Perubahan moderasi menambahkan `posts.deleted_at`, `posts.removal_reason`, serta
`user_activities.description` dan `user_activities.reason` melalui AutoMigrate
saat startup. Tidak perlu mengimpor database laptop. Startup tetap menjalankan
kebijakan lama: akun dengan status pending_deletion lebih dari 30 hari dihapus
permanen. Cadangan database wajib dipertahankan, termasuk untuk memulihkan
penghapusan yang tidak diinginkan. Arsip uploads/storage diperiksa dan checksum
database/arsip disimpan di `SHA256SUMS`; pemeriksaan ini belum membuktikan bahwa
database dapat di-restore. Simpan salinan backup di luar instance juga.
Folder build dan backup
dipertahankan untuk pemeriksaan; hapus backup lama sesuai kebijakan retensi
setelah rilis dinyatakan baik agar disk tidak penuh.

## Batas sesi login

Untuk batas sesi tanpa aktivitas 12 jam, pastikan `.env` server memuat
`SESSION_IDLE_TIMEOUT_SECONDS=43200`, lalu restart service aplikasi setelah
rilis backend. Nilai lama di `.env` tetap mengalahkan default kode yang baru.

## 4. Konfigurasi telepon/VC pertama kali

```bash
bash deploy/ec2/configure-turn.sh
```

Script mengambil Public/Private IPv4 melalui EC2 IMDSv2, membuat secret acak di
server, memasang coturn dengan autentikasi, menambahkan `TURN_URLS` dan
`TURN_SHARED_SECRET` ke `.env`, lalu restart layanan. Secret tidak dicetak.
IP/secret tidak masuk Git. Jika metadata dinonaktifkan, gunakan:

```bash
bash deploy/ec2/configure-turn.sh PUBLIC_IPV4 PRIVATE_IPV4
```

Konfigurasi coturn yang sudah aktif dan bukan dikelola script Postter tidak akan
ditimpa. Cadangan konfigurasi berada di `/var/backups/postter-turn.*`. Script
mempertahankan secret yang sudah dibuatnya saat dijalankan ulang.

Pada AWS Console, buka Security Group instance dan tambahkan inbound:

| Type/protokol | Port | Source |
| --- | --- | --- |
| Custom TCP | 3478 | `0.0.0.0/0` |
| Custom UDP | 3478 | `0.0.0.0/0` |
| Custom UDP | 49160–49260 | `0.0.0.0/0` |

Ini tidak membuka MySQL atau backend Go. Jika UFW aktif, script menambahkan
izin lokal yang sama. Relay ini memakai bandwidth instance. TURN TLS belum
diaktifkan; sebagian jaringan yang hanya mengizinkan TLS memerlukan konfigurasi
tambahan. Lihat [CALLS_EC2.md](CALLS_EC2.md).

## 5. Verifikasi akhir

```bash
systemctl is-active postter nginx mysql coturn
curl --fail https://postter.us/api/v1/health/ready
git -C /opt/postter status -sb
```

Login ulang atau muat ulang kedua browser untuk memakai aset baru. Uji dua akun
di dua perangkat dengan Wi-Fi dan jaringan seluler: pesan masuk, fokus input
setelah Enter/Kirim, status online/offline, upload gambar, panggilan suara dua arah,
dan VC dua arah. Izin mikrofon/kamera wajib diaktifkan.

Jika layanan gagal, periksa `journalctl -u postter -n 60 --no-pager` atau
`journalctl -u coturn -n 60 --no-pager` di server; jangan kirim secret dari log.
