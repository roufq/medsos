# Status Functional Requirements

Status diverifikasi terhadap kode dan smoke test API (53 skenario) pada 2026-10-05.

## User management

| Fitur | Status |
|---|---|
| Registrasi akun (nama, email, username opsional, jenis akun, telepon E.164 + kode negara) | Tersedia |
| Login email/username dan password | Tersedia |
| OAuth Google/Facebook/LinkedIn/TikTok/Apple | Tombol & adapter tersedia, credential provider belum diisi |
| Logout | Mencabut refresh token di server, bukan hanya menghapus cookie |
| Refresh token | Sekali pakai (rotasi atomik); refresh token tidak bisa dipakai sebagai access token |
| Forgot/reset password | Kode via email/SMS/WhatsApp; reset mengeluarkan semua sesi |
| Verifikasi email/telepon | Email via SMTP; SMS/WhatsApp lewat webhook, provider belum diisi |
| Ubah/tambah password | Akun OAuth dapat membuat password pertama; ubah password mengeluarkan sesi lain |
| Profil (foto, header, bio, lokasi, website) | Tersedia; foto harus hasil upload sendiri, website hanya http(s) |
| Pengaturan (username, nama, telepon per negara, email, kota, negara, tempat & tanggal lahir, gender, jenis akun, minat, kategori shop) | Tersedia |
| Follow/unfollow, permintaan follow akun private | Tersedia |
| Cari followers/following | Tersedia (modal dengan pencarian) |
| Hapus akun dan reaktivasi 30 hari | Tersedia (password, atau login OAuth untuk akun tanpa password) |
| Akun private | Tersedia; profil menampilkan header terkunci untuk non-pengikut |
| Block/unblock | Tersedia, termasuk daftar akun diblokir di Pengaturan |
| Layout profil grid/long card | Tersedia |
| Simpan post (tab Tersimpan) dan repost | Tersedia |

## Post management

| Fitur | Status |
|---|---|
| Judul wajib 5–100 karakter | Tervalidasi (backend + form) |
| Deskripsi 160–6000 kata | Tervalidasi; post shop cukup deskripsi tidak kosong |
| Hashtag wajib 3–9 (shop 3–30) | Tervalidasi; `#tag` di teks ikut dihitung |
| Mention 1–10 user (shop 0–10) | Tervalidasi; user tidak dikenal/memblokir ditolak |
| Gambar 1–6, maks 10 MB/file | Tervalidasi; JPEG/PNG dikompresi, EXIF/GPS dihapus |
| Video maks 30 menit | Tervalidasi dengan ffprobe; ditranscode ke MP4 H.264 |
| Format video | MP4, MOV, AVI, WMV, FLV, WebM, MKV, MPEG, MPEG-TS, MXF (codec H.264, HEVC, ProRes, DNxHR, CineForm) |
| Shorts 60–90 detik | Ditandai otomatis; halaman `/shorts` |
| Link preview | Tersedia melalui queue; deskripsi tetap wajib |
| Location | Input teks + tombol "Lokasi saya" (Google Geocoding bila key diisi, selain itu OpenStreetMap) |
| Edit (judul, deskripsi, media, mention, hashtag, link, data shop) | Tersedia, divalidasi ulang dengan aturan yang sama |
| Delete | Tersedia |
| Like (ikon hati), komentar, balas, edit & hapus komentar | Tersedia |
| Share ke pesan, Facebook, X, Threads, LinkedIn, Instagram, Telegram, TikTok, WhatsApp, Pinterest | Tersedia; Instagram/TikTok menyalin link (tidak ada web share intent) |
| Embed post | Tersedia (`/embed/posts/{id}`), hanya post publik |
| Report | Tersedia; tidak bisa melaporkan post sendiri |
| View counter | Dihitung saat post terlihat ≥1 detik, unik per user |
| Notifikasi mention (post & komentar), like, komentar | Tersedia |

## Shop post

Harga (ISO 4217, satuan minor), kategori, kondisi baru/bekas, stok, merek, pengiriman (ambil langsung/COD/ekspedisi), metode pembayaran, 1–6 gambar, dan maksimal 1 video 30–90 detik. Like, komentar, share, embed, report, repost, dan views berlaku sama seperti post biasa.

## Media

- Storage lokal di folder `uploads`; setiap upload dicatat di tabel `media_uploads`, dan post hanya boleh memakai upload milik penulisnya.
- Batas ukuran: `MEDIA_MAX_IMAGE_MB` (default 10) dan `MEDIA_MAX_UPLOAD_MB` (default 1024).
- Jenis file dideteksi dari isi file (magic bytes), bukan dari ekstensi.
- Cloud storage (S3/GCS) dan CDN belum dikonfigurasi.

## Non-functional requirements

Bcrypt, validasi input, rate limit, CSRF untuk cookie, pemeriksaan isi file, pencabutan sesi (blokir, hapus akun, ganti/reset password) tersedia. Status akun dicek di setiap request dengan cache 10 detik per instance. Target `<2 detik`, 100 ribu DAU, 99% uptime, CDN, observability, backup, dan disaster recovery memerlukan deployment serta load test production.

## Role

User dapat mengelola post miliknya dan berinteraksi dengan post. Admin dapat melihat report, menghapus post, dan memblokir user; blokir berlaku seketika dan mencabut semua token user tersebut.

## Belum tersedia

Feed rekomendasi berbasis algoritma (feed masih urut waktu), cloud storage/CDN, credential provider OAuth/SMS/WhatsApp, dan load test skala production.
