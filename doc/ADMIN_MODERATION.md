# Aktivitas pengguna dan moderasi admin

Panel `/admin/dashboard` menyediakan tab **Aktivitas** dan **Konten & iklan**.
Seluruh endpoint berada di belakang autentikasi dan middleware admin. Penghapusan
dan pemulihan juga memeriksa ulang peran serta status aktif admin di database.

## Aktivitas

Riwayat memiliki filter ID pengguna, tanggal awal/akhir (UTC), dan metode
tindakan. Pagination memakai ID catatan terakhir untuk riwayat tindakan. Sesi
memiliki pagination tersendiri, dengan filter pengguna dan tanggal aktivitas
terakhir. Filter metode tidak berlaku pada sesi. Nama, ID, dan username pengguna
ditampilkan untuk membantu penelusuran.

Tindakan berhasil dicatat dengan deskripsi yang mudah dibaca dan path endpoint.
Pembukaan feed, Explore, pencarian, postingan, dan profil oleh pengguna login
juga dicatat. Sesi login baru dicatat satu kali; refresh token dan heartbeat tidak
menambah catatan. Isi pesan pribadi, body request, password, token, parameter
pencarian, dan polling rutin tidak disimpan dalam riwayat.

Catatan sebelum fitur tersedia tidak direkonstruksi. Catatan lama yang hanya
memiliki metode/path mendapatkan deskripsi saat dibaca. Riwayat ini adalah
aktivitas aplikasi yang berhasil, bukan rekaman setiap klik atau riwayat tamu
yang belum login.

## Moderasi konten

Admin dapat mencari semua jenis postingan, meninjau isi/media dalam panel admin,
dan memilih status aktif, dihapus, atau semua. Privasi akun tidak membatasi
akses moderasi. Tampilan publik tetap mengikuti aturan privasi pengguna.

Penghapusan memerlukan alasan 5–300 karakter. Postingan diberi `deleted_at`,
sehingga tidak muncul dalam feed, Explore, profil, detail publik, repost yang
merujuknya, atau sitemap. Data dan media dipertahankan agar dapat dipulihkan.
Pemulihan mempertahankan visibilitas asli: konten privat tidak menjadi publik.

Perubahan konten, catatan admin/alasan, dan notifikasi kepada pemilik disimpan
dalam satu transaksi. Penguncian baris mencegah moderasi serentak menghasilkan
notifikasi ganda. Penghapusan melalui laporan dan halaman admin SSR juga memakai
mekanisme yang sama. Alasan dari laporan digunakan saat laporan diselesaikan.
Konten yang dihapus permanen sebelum pembaruan ini tidak dapat dipulihkan.

## Rilis dan pengujian

Startup AutoMigrate menambahkan `posts.deleted_at`, `posts.removal_reason`, serta
`user_activities.description` dan `user_activities.reason`. Cadangkan database
sebelum rilis dan gunakan alur build backend/frontend pada `doc/UPDATE_EC2.md`.
Backend lama belum mengenali penanda konten terhapus; jangan mengandalkannya
untuk menyembunyikan konten yang dimoderasi oleh versi ini.

Tes MySQL terisolasi mencakup semua jenis postingan, akun privat, otorisasi,
notifikasi, rollback transaksi, moderasi serentak, filter tanggal/pengguna,
pagination aktivitas/sesi, serta akses konten setelah dihapus/dipulihkan.
Tes middleware memeriksa penolakan pengguna biasa; tes kebijakan aktivitas
memastikan polling dan pembacaan pesan pribadi tidak direkam.
Pengujian browser memakai data demo untuk alasan wajib, daftar terhapus,
pemulihan, filter, dan pemuatan riwayat berikutnya. Belum diterapkan ke AWS.
