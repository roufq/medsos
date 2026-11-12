# Deployment awal Postter pada EC2 Ubuntu 24.04

Target: x86_64, satu server Go + MySQL + Nginx + FFmpeg. Binary Linux dan hasil build React disiapkan di komputer lokal agar EC2 tidak perlu melakukan build. Queue berjalan di proses backend dengan satu job bersamaan.

Installer ini untuk server baru. Installer menolak menimpa `/opt/postter`, service, konfigurasi Nginx Postter, atau database `postter` yang sudah ada. Database lokal, akun lokal, upload lokal, dan `.env` lokal tidak disertakan. Server mendapatkan database kosong dan secret acak baru.

## 1. DNS dan akses jaringan

Di Cloudflare, tambahkan record berikut untuk pemasangan awal:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | @ | 3.106.139.106 | DNS only |

Security group EC2 harus membuka TCP 80 dan 443 ke internet. SSH 22 mengizinkan IP komputer untuk SCP dan prefix list EC2 Instance Connect jika menggunakan terminal browser. MySQL 3306 dan backend 3000 tetap lokal.

IP publik otomatis dapat berubah setelah instance di-stop lalu di-start. Jika berubah, perbarui DNS dan konfigurasi Nginx atau gunakan Elastic IP setelah memeriksa kelayakan serta biayanya pada akun.

## 2. Unggah paket dari PowerShell komputer lokal

Paket tersedia di `D:\www\medsos\tmp\postter-ec2.tar.gz`. Ganti lokasi key sesuai file milik Anda:

```powershell
scp -i "C:\lokasi-key\postter-web.pem" "D:\www\medsos\tmp\postter-ec2.tar.gz" ubuntu@3.106.139.106:/home/ubuntu/
```

Jalankan perintah SCP pada komputer Windows, bukan pada terminal AWS. Verifikasi fingerprint host pada koneksi pertama. File `.pem` tetap berada di komputer lokal.

## 3. Pasang di terminal AWS

```bash
mkdir -p ~/postter-deploy
tar -xzf ~/postter-ec2.tar.gz -C ~/postter-deploy
cd ~/postter-deploy
sudo bash install.sh postter.us 3.106.139.106
```

Installer memasang paket Ubuntu, membuat database serta user MySQL yang dibatasi ke database aplikasi, menulis secret baru, memasang service systemd, mengatur Nginx, dan memeriksa readiness. Backend otomatis hidup setelah reboot.

Periksa hasilnya:

```bash
sudo systemctl status postter --no-pager
curl --fail http://127.0.0.1:3000/api/v1/health/ready
curl --fail -H 'Host: postter.us' http://127.0.0.1/api/v1/health/ready
```

## 4. Aktifkan HTTPS setelah DNS mengarah ke server

```bash
cd ~/postter-deploy
sudo bash enable-https.sh postter.us
sudo certbot renew --dry-run
```

Certbot meminta persetujuan ketentuan layanan serta email kontak jika belum dikonfigurasi. Script memperbarui APP_URL, FRONTEND_URL, CORS, dan cookie secure setelah penerbitan sertifikat berhasil. Situs publik: `https://postter.us`.

Gunakan HTTPS sebelum memakai akun sungguhan. Akses kamera/mikrofon browser untuk panggilan juga membutuhkan secure context. Sertifikat ini mencakup `postter.us`; `www.postter.us` perlu DNS dan sertifikat tersendiri jika nanti dipakai.

## 5. Akun dan layanan tambahan

- Buat akun baru melalui `/register`; tidak ada akun admin/password default.
- Untuk menjadikan akun tertentu sebagai admin, setelah registrasi buka `sudo mysql postter`, lalu jalankan SQL berikut dengan email akun Anda:

```sql
UPDATE users SET role = 'admin' WHERE email = 'EMAIL_AKUN_ANDA';
```

- Keluar lalu login kembali setelah perubahan role.
- SMTP, OAuth, SMS, dan WhatsApp perlu konfigurasi provider terpisah di `/opt/postter/.env`, kemudian `sudo systemctl restart postter`.
- Upload tersimpan di `/opt/postter/uploads`; database di MySQL lokal. Backup keduanya sebelum pembaruan. Tabel dibuat atau dimigrasikan otomatis saat startup.
- Pemrosesan video pada t3.small Standard tetap dibatasi kapasitas CPU/RAM server; belum ada jaminan kapasitas pengguna tanpa load test.

## Diagnosis

```bash
sudo journalctl -u postter -n 80 --no-pager
sudo nginx -t
sudo systemctl status mysql nginx --no-pager
```

Periksa log sebelum membagikannya dan hapus credential/token bila ada. Jangan membagikan `.env` atau key SSH.

## Menyiapkan ulang paket dari source

Build frontend dengan `npm run build` di folder `frontend`. Build Go dengan `GOOS=linux`, `GOARCH=amd64`, dan `CGO_ENABLED=0`. Arsip hanya berisi binary `postter`, `frontend/dist`, `resources`, kedua script di `deploy/ec2`, serta dokumen ini. Jangan menyertakan `.env`, `.git`, `uploads`, `tmp`, atau file `.pem`.

Perubahan kode setelah paket dibuat memerlukan build dan unggahan paket baru. Installer awal tidak digunakan untuk menimpa instalasi yang sudah berjalan.
