# Konfigurasi Provider Eksternal

Credential jangan disimpan di Git atau dikirim melalui chat. Simpan di `.env` production atau secret manager.

## Email SMTP

```dotenv
MAIL_HOST=smtp.provider.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=no-reply@domain.com
MAIL_FROM_NAME=Connect Modern
```

Untuk lokal, Mailpit menggunakan `127.0.0.1:1025` dan inbox berada di `http://localhost:8025`.

## OAuth

```dotenv
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_FACEBOOK_CLIENT_ID=
OAUTH_FACEBOOK_CLIENT_SECRET=
OAUTH_LINKEDIN_CLIENT_ID=
OAUTH_LINKEDIN_CLIENT_SECRET=
OAUTH_TIKTOK_CLIENT_ID=
OAUTH_TIKTOK_CLIENT_SECRET=
OAUTH_APPLE_CLIENT_ID=
OAUTH_APPLE_CLIENT_SECRET=
```

Callback production:

```text
https://domain.com/api/v1/auth/oauth/{provider}/callback
```

Setelah callback berhasil, browser diarahkan ke `FRONTEND_URL` (atau `APP_URL` bila kosong). Login OAuth dalam 30 hari setelah hapus akun otomatis mengaktifkan akun kembali; akun yang diblokir admin tetap ditolak.

## URL publik

```dotenv
APP_URL=https://domain.com
# Opsional, bila SPA disajikan dari domain lain:
FRONTEND_URL=https://app.domain.com
```

Dipakai untuk link share (`/p/{id}`, berisi tag OpenGraph), kode embed (`/embed/posts/{id}`), dan redirect OAuth. Cookie sesi otomatis diberi flag `Secure` bila `APP_URL` memakai `https://`.

## Batas media

```dotenv
MEDIA_MAX_IMAGE_MB=10     # per gambar, default 10, maks 50
MEDIA_MAX_UPLOAD_MB=1024  # per video, default 1024, maks 4096
```

Server memerlukan `ffprobe` (validasi video & durasi maks 30 menit) dan `ffmpeg` (transcode ke MP4 H.264).

## SMS dan WhatsApp

```dotenv
SMS_WEBHOOK_URL=
SMS_WEBHOOK_TOKEN=
WHATSAPP_WEBHOOK_URL=
WHATSAPP_WEBHOOK_TOKEN=
```

WhatsApp Business API juga memerlukan phone number ID, business account ID, access token, dan template pesan yang disetujui Meta.

## Cloud storage

Contoh AWS S3/Cloudflare R2:

```dotenv
STORAGE_DRIVER=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-southeast-1
AWS_BUCKET=
AWS_ENDPOINT=
MEDIA_PUBLIC_URL=https://cdn.domain.com
```

Gunakan IAM policy terbatas, signed URL untuk file privat, lifecycle policy, backup, dan scanning media.

## Google Maps

```dotenv
# frontend/.env — dipakai tombol "Lokasi saya" di form posting (Geocoding API).
VITE_GOOGLE_MAPS_API_KEY=
```

Tanpa key, frontend memakai OpenStreetMap Nominatim untuk reverse geocoding. Aktifkan Geocoding API dan batasi key berdasarkan domain (HTTP referrer).

## Pembayaran

Pilih Midtrans, Xendit, DOKU, atau Stripe.

```dotenv
PAYMENT_PROVIDER=midtrans
PAYMENT_SERVER_KEY=
PAYMENT_CLIENT_KEY=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_CALLBACK_URL=https://domain.com/api/v1/payments/webhook
```

Webhook harus idempotent dan mendukung status pending, paid, expired, failed, serta refund.

## Social publishing

Facebook Pages, Instagram Graph, LinkedIn, TikTok, X, Telegram, WhatsApp, Pinterest, dan Threads masing-masing memerlukan app credential, permission scope, callback, access token, serta proses review platform.
