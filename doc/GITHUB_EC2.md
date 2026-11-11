# Menghubungkan EC2 ke repository GitHub

Repository: `roufq/medsos`. Pengembangan lokal memakai branch `ahmad`; AWS memakai branch `production` di `/opt/postter`. Clone sebelumnya di `/home/ubuntu/medsos` tidak melayani website.

Koneksi ini memungkinkan server mengambil kode dengan `git pull`. Koneksi ini belum menjalankan build atau deployment otomatis, dan tidak mengubah `.env`, uploads, database, maupun service yang sedang berjalan.

## Pembagian branch

| Branch | Penggunaan |
|---|---|
| `ahmad` | Pengembangan dan pengujian di komputer lokal |
| `production` | Source yang dipilih untuk server publik AWS |
| `hotfix/...` | Perbaikan kode dari AWS yang perlu disimpan dan dikembalikan ke jalur pengembangan |

Branch `production` dibuat dari versi awal yang sama dengan `ahmad`. Setelah dipisahkan, push ke `ahmad` tidak mengubah `production`. Untuk rilis, buka pull request dengan base `production` dan compare `ahmad`, periksa perubahan, lalu merge. Setelah itu server mengambil `production` dan menjalankan proses build/deploy.

Jika memperbaiki kode langsung di AWS, simpan pada branch `hotfix/...` dan masukkan perbaikannya kembali ke `production` serta `ahmad` melalui merge. Jangan menimpa perubahan server dengan reset paksa. Deploy key saat ini hanya memiliki akses baca; push dari server memerlukan kredensial dengan akses tulis yang diatur tersendiri. Pemisahan branch tidak menambah izin pada key.

Postingan, akun, komentar, dan metadata upload berada di database; file upload berada di `/opt/postter/uploads`. Data ini tidak berpindah melalui Git dan tidak ikut pergantian branch.

## Mengganti instalasi yang sudah terhubung dari ahmad ke production

Jangan jalankan ulang script penghubung pada instalasi yang sudah mempunyai `.git`. Jalankan di terminal AWS:

```bash
sudo git -C /opt/postter status --short
sudo git -C /opt/postter fetch origin
sudo git -C /opt/postter switch --track origin/production
sudo git -C /opt/postter status --short --branch
```

Jika status awal menunjukkan file source berubah, simpan perubahan itu pada branch hotfix sebelum berganti branch. Perintah switch di atas untuk pembuatan branch lokal pertama kali; jika branch lokal `production` sudah ada, gunakan `sudo git -C /opt/postter switch production`. Perubahan branch tidak membangun ulang binary/frontend dan tidak membutuhkan restart untuk tahap penyambungan ini.

## 1. Buat deploy key di terminal AWS

Jalankan sebagai pengguna `ubuntu`, termasuk jika terminal sebelumnya berada di shell root:

```bash
sudo -iu ubuntu
sudo apt-get update
sudo apt-get install -y git openssh-client
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

Buat key khusus repository ini. Perintah berikut memakai kembali key yang sudah ada dan tidak menimpanya:

```bash
if [ ! -f ~/.ssh/postter_github ]; then ssh-keygen -t ed25519 -C "postter-ec2" -f ~/.ssh/postter_github -N ""; fi
chmod 600 ~/.ssh/postter_github
cat ~/.ssh/postter_github.pub
```

Key ini berbeda dari file `.pem` untuk masuk ke EC2. Salin hanya baris public key yang dimulai `ssh-ed25519`; private key `postter_github` tetap di server.

## 2. Daftarkan public key di GitHub

Buka `https://github.com/roufq/medsos/settings/keys`, pilih **Add deploy key**:

- Title: `Postter EC2`.
- Key: isi public key `postter_github.pub` dari server.
- **Allow write access**: biarkan tidak dicentang.
- Pilih **Add key**.

Deploy key memberi akses baca ke satu repository. Dokumentasi: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys

## 3. Tes koneksi

Di terminal AWS yang sama:

```bash
ssh -i ~/.ssh/postter_github -o IdentitiesOnly=yes -T git@github.com
```

Pada koneksi pertama, cocokkan fingerprint dengan https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints sebelum menerima host key.

Pesan keberhasilan menyebut **successfully authenticated** dan **GitHub does not provide shell access**. Exit code 1 pada tes ini normal; itu bukan tanda autentikasi gagal.

## 4. Hubungkan folder aplikasi aktif

Script `deploy/ec2/connect-live-git.sh` menghubungkan instalasi yang sudah ada ke GitHub. Unggah script itu ke `/home/ubuntu/connect-live-git.sh`, lalu jalankan di terminal AWS:

```bash
sudo bash /home/ubuntu/connect-live-git.sh
sudo git -C /opt/postter remote -v
sudo git -C /opt/postter branch --show-current
```

Script memeriksa akses ke remote branch `production`, mencadangkan instalasi ke direktori privat `/var/backups/postter-before-git.*`, membuat metadata Git baru, mengambil branch `production`, menolak revision yang melacak file runtime, lalu menempatkan source di folder aplikasi. `.env`, binary `postter`, hasil build frontend, uploads, dan storage dipertahankan. Database dan service tidak diubah. Script menolak berjalan ulang bila `.git` sudah ada; jika gagal, periksa error sebelum melanjutkan.

## 5. Mengambil perubahan selanjutnya

Setelah perubahan lokal di `ahmad` diperiksa dan di-merge ke `production`, jalankan di AWS saat branch aktif adalah `production`:

```bash
sudo git -C /opt/postter pull --ff-only origin production
```

Perintah ini memperbarui source langsung di folder aplikasi aktif. Binary Go dan frontend tetap perlu dibangun, diterapkan, dan diperiksa sebelum update terlihat di website. `systemctl restart postter` saja tidak membangun ulang kode. Jangan jalankan installer awal untuk menimpa aplikasi aktif.
