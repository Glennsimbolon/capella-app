# Capella Multidana

Aplikasi pengajuan kredit digital dengan dua peran: Nasabah dan Admin.

🔗 **Live Demo:** https://Glennsimbolon.github.io/capella-app

---

## Tentang Proyek

Capella Multidana adalah sistem pengajuan kredit berbasis web yang memungkinkan nasabah mengajukan pinjaman secara online dan admin melakukan verifikasi. Aplikasi ini dirancang untuk memudahkan proses pengajuan kredit dengan simulasi angsuran yang transparan dan real-time.

---

## Teknologi

- React 18
- Vite
- Tailwind CSS
- Supabase (Database & Realtime)
- React Router DOM
- GitHub Pages

---

## Fitur

### Nasabah
- Registrasi dengan Email & NIK (NIK unik)
- Login dengan Email
- Pengajuan kredit dengan simulasi angsuran
- Maksimal 3 pengajuan aktif
- Nominal maksimal Rp 200.000.000
- Tenor maksimal 24 bulan
- Penghasilan minimal Rp 1.000.000
- Riwayat pengajuan
- Update status real-time

### Admin
- Dashboard statistik
- Verifikasi pengajuan (Approve/Reject)
- Lihat simulasi kredit nasabah
- Tambahkan catatan pada pengajuan
- Real-time update

---

## Cara Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/Glennsimbolon/capella-app.git
cd capella-app

### 2. Install Depencies
npm install

### 3. Jalankan Aplikasi
npm run dev
🔑 Cara Mengakses Aplikasi
🌐 Link Aplikasi
text
https://Glennsimbolon.github.io/capella-app
👤 Login sebagai Nasabah
Langkah-langkah:
Buka link di atas

Masukkan email dan password

Klik tombol "Masuk"

Akun Demo Nasabah:
Email	Password
user@gmail.com	user123
rina@gmail.com	rina123
dedi@gmail.com	dedi123
lina@gmail.com	lina123
fajar@gmail.com	fajar123
🛡️ Login sebagai Admin
Langkah-langkah:
Buka link admin:

text
https://Glennsimbolon.github.io/capella-app/admin/login
Masukkan email dan password admin

Klik tombol "Masuk sebagai Admin"

Akun Demo Admin:
Email	Password
admin@capella.com	admin123
📋 Perbedaan Akses
Role	URL	Bisa Melihat
Nasabah	/	Halaman pengajuan & riwayat sendiri
Admin	/admin/login	Semua pengajuan nasabah
⚠️ Catatan Penting
Halaman admin tidak terlihat oleh nasabah biasa

Admin harus mengakses langsung melalui URL di atas

Gunakan akun demo di atas untuk mencoba semua fitur

🚀 Fitur yang Bisa Dicoba
Nasabah:
Registrasi akun baru

Ajukan pinjaman dengan simulasi

Lihat riwayat pengajuan

Admin:
Lihat dashboard statistik

Verifikasi pengajuan (Approve/Reject)

Lihat simulasi kredit nasabah

