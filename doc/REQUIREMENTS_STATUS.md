# Status Functional Requirements

## User management

| Fitur | Status |
|---|---|
| Registrasi akun | Tersedia |
| Login email/username dan password | Tersedia |
| OAuth Google/Facebook/LinkedIn/TikTok/Apple | Adapter tersedia, credential provider belum diisi |
| Logout dan refresh token | Tersedia |
| Forgot/reset password | Tersedia melalui kode verifikasi |
| Verifikasi email | Tersedia melalui SMTP |
| Verifikasi SMS/WhatsApp | Adapter webhook tersedia, provider belum diisi |
| Update profil dan pengaturan | Backend tersedia |
| Follow/unfollow dan followers/following | Tersedia |
| Hapus akun dan reaktivasi 30 hari | Tersedia |
| Private account | Tersedia |
| Block/unblock | Tersedia |
| Layout grid/long | Backend tersedia |
| Saved post dan repost | Tersedia |

## Post management

| Fitur | Status |
|---|---|
| Judul 5–100 karakter | Tervalidasi |
| Deskripsi 1–6000 kata | Tervalidasi |
| Hashtag opsional, maks 9 (shop maks 30) | Tervalidasi |
| Mention opsional, maks 10 user | Tervalidasi |
| Gambar 1–6 | Tervalidasi |
| Video dan short 60–90 detik | Tersedia |
| Video maksimal 30 menit | Tervalidasi |
| Link preview | Tersedia melalui queue |
| Location | Input teks tersedia; Google Maps belum dihubungkan |
| Edit/delete post | Tersedia |
| Like, komentar, reply | Tersedia |
| Share, report, embed, repost | Endpoint tersedia |
| View counter | Tersedia |
| Notifikasi mention/like/comment | Tersedia di database |

## Shop post

Shop post mendukung harga minor unit, ISO currency, kategori, kondisi barang, stok, brand, fulfillment, payment method, gambar, dan video produk 30–90 detik.

## Media

- Storage lokal tersedia di folder `uploads`.
- `MEDIA_MAX_UPLOAD_MB` dapat diatur sampai 1024 MB.
- Format yang divalidasi: JPEG, PNG, GIF, WebP, MP4, WebM, MOV, AVI, dan MPEG.
- Video diperiksa dengan `ffprobe` dan dibatasi maksimal 30 menit.
- Cloud storage, CDN, image compression, dan transcoding production belum dikonfigurasi.

## Non-functional requirements

Security dasar, bcrypt, validasi input, rate limit, dan pemeriksaan MIME tersedia. Target `<2 detik`, 100 ribu DAU, 99% uptime, CDN, observability, backup, dan disaster recovery memerlukan deployment serta load test production.

## Role

User dapat mengelola post miliknya dan berinteraksi dengan post. Admin dapat melihat report, menghapus post, dan memblokir user.
