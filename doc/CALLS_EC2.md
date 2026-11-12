# Telepon dan video call di EC2

Backend dan frontend harus dirilis bersama: frontend memakai endpoint autentikasi
`GET /api/v1/messages/call/config` dan acknowledgement sinyal pada endpoint polling.
`git pull` saja belum mengganti binary Go atau `frontend/dist` yang sedang dipakai.
Tidak ada migrasi database untuk perubahan ini.

## TURN untuk jaringan berbeda

Tanpa TURN, panggilan hanya berhasil jika browser dapat membuat koneksi langsung.
STUN saja tidak menjamin audio/video dapat melewati NAT atau firewall pengguna.
Panduan resmi: https://webrtc.org/getting-started/turn-server

Backend menerima konfigurasi berikut dari `.env` server:

```dotenv
TURN_URLS="turn:PUBLIC_IPV4:3478?transport=udp,turn:PUBLIC_IPV4:3478?transport=tcp"
TURN_SHARED_SECRET="SECRET_ACAK_DARI_OPENSSL"
```

Ganti `PUBLIC_IPV4` dengan IP publik tetap server TURN. Secret harus sama dengan
`static-auth-secret` coturn. Jangan memakai variabel `VITE_*` untuk shared secret.
Browser hanya menerima username dan credential sementara yang berlaku satu jam.

### Memasang coturn di instance Ubuntu yang sama

Jalankan perintah ini di terminal AWS, bukan PowerShell lokal:

```bash
sudo apt-get update
sudo apt-get install -y coturn
openssl rand -hex 32
```

Simpan hasil perintah terakhir sebagai secret; jangan kirim ke chat atau GitHub.
Jika `/etc/turnserver.conf` sudah memiliki konfigurasi yang digunakan, cadangkan
sebelum mengubahnya. Edit dengan `sudoedit /etc/turnserver.conf`:

```ini
listening-port=3478
fingerprint
use-auth-secret
static-auth-secret=SECRET_ACAK_DARI_OPENSSL
realm=postter.us
external-ip=PUBLIC_IPV4/PRIVATE_IPV4
min-port=49160
max-port=49260
no-tls
no-dtls
no-cli
no-multicast-peers
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
user-quota=12
total-quota=120
```

Ganti kedua placeholder IP dengan Public IPv4 dan Private IPv4 instance tersebut.
Pemetaan public/private dibutuhkan karena EC2 berada di belakang NAT AWS.
Jangan tambahkan `allow-loopback-peers` atau menjalankan relay tanpa autentikasi.
Konfigurasi ini menyediakan TURN UDP/TCP pada 3478, bukan TURN TLS. Untuk jaringan
yang hanya mengizinkan TLS, pasang listener TLS dengan sertifikat yang valid dan
tambahkan URL `turns:`; jangan arahkan `turns:` ke listener tanpa TLS.

Pada Security Group instance, izinkan inbound berikut dari pengguna internet:

| Protokol | Port | Kegunaan |
| --- | --- | --- |
| UDP | 3478 | Koneksi pengguna ke TURN |
| TCP | 3478 | Koneksi TURN ketika UDP klien dibatasi |
| UDP | 49160–49260 | Port relay media |

Jika UFW aktif, izinkan port yang sama. Nginx HTTP tidak meneruskan trafik TURN.
Pertahankan akses HTTPS 443 yang sudah ada untuk aplikasi.

Tambahkan dua variabel `.env` di atas pada `/opt/postter/.env`, kemudian:

```bash
sudo systemctl enable --now coturn
sudo systemctl restart coturn
sudo systemctl restart postter
sudo systemctl is-active coturn postter
```

Periksa konfigurasi resmi coturn:
https://github.com/coturn/coturn/blob/master/examples/etc/turnserver.conf

TURN meneruskan audio/video melalui instance dan memakai bandwidth AWS. Pantau
penggunaan data, disk log, dan billing; jangan menganggap relay gratis tanpa batas.

## Verifikasi setelah rilis

1. Gunakan dua akun pada dua perangkat, satu Wi-Fi dan satu jaringan seluler.
2. Izinkan mikrofon, lalu uji suara dua arah dan video dua arah.
3. Jika browser memblokir audio, tekan **Aktifkan suara** pada layar panggilan.
4. Status menghubungkan harus menunggu koneksi WebRTC; durasi baru berjalan
   setelah koneksi terbentuk. Kegagalan koneksi memiliki batas waktu 30 detik.
5. Buka tab Home dan tab Messages tambahan pada akun yang sama. Panggilan tetap
   ditangani satu tab Messages; tab lainnya tidak boleh mengambil sinyalnya.
6. Untuk memastikan TURN benar-benar dipakai, pada lingkungan pengujian gunakan
   `iceTransportPolicy: 'relay'` dan periksa pasangan kandidat `relay` melalui
   `chrome://webrtc-internals` atau `about:webrtc`. Jangan menganggap status
   `turn_available: true` sebagai bukti port relay sudah dapat diakses.

Browser harus mendukung Web Locks dan memakai HTTPS (localhost juga didukung).
Panggilan belum memakai Web Push; tab yang ditutup atau browser yang dihentikan
tidak akan menerima panggilan. Sesi sinyal disimpan di memori satu proses backend;
restart saat panggilan berlangsung menghilangkan sesi kendali tersebut.

## Tes lokal

```bash
go test ./app/http/controllers ./routes
node --test --test-isolation=none frontend/src/utils/callMedia.test.mjs
cd frontend
npm run build
```
