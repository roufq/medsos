# Menghubungkan EC2 ke repository GitHub

Repository: `roufq/medsos`, branch `ahmad`. Target yang diinginkan adalah `/opt/postter` menjadi checkout repository sekaligus folder aplikasi aktif. Clone sebelumnya di `/home/ubuntu/medsos` tidak melayani website.

Koneksi ini memungkinkan server mengambil kode dengan `git pull`. Koneksi ini belum menjalankan build atau deployment otomatis, dan tidak mengubah `.env`, uploads, database, maupun service yang sedang berjalan.

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

Script mencadangkan instalasi ke direktori privat `/var/backups/postter-before-git.*`, membuat metadata Git baru, mengambil branch `ahmad`, menolak revision yang melacak file runtime, lalu menempatkan source di folder aplikasi. `.env`, binary `postter`, hasil build frontend, uploads, dan storage dipertahankan. Database dan service tidak diubah. Script menolak berjalan ulang bila `.git` sudah ada; jika gagal, periksa error sebelum melanjutkan.

## 5. Mengambil perubahan selanjutnya

Setelah kode dari komputer lokal di-push ke branch `ahmad`:

```bash
sudo git -C /opt/postter pull --ff-only origin ahmad
```

Perintah ini memperbarui source langsung di folder aplikasi aktif. Binary Go dan frontend tetap perlu dibangun, diterapkan, dan diperiksa sebelum update terlihat di website. `systemctl restart postter` saja tidak membangun ulang kode. Jangan jalankan installer awal untuk menimpa aplikasi aktif.
