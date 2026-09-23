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
GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_KEY=
```

Aktifkan Maps JavaScript, Places, dan Geocoding API. Batasi key berdasarkan domain dan IP.

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
