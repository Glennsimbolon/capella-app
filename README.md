# Capella Multidana

Aplikasi pengajuan kredit digital berbasis web untuk Nasabah dan Admin.

Live Demo: https://Glennsimbolon.github.io/capella-app

---

## Deskripsi
Sistem pengajuan kredit online dengan simulasi angsuran real-time. Memungkinkan nasabah mengajukan pinjaman dan admin memverifikasi pengajuan.

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
- Verifikasi pengajuan (Approve / Reject)
- Lihat simulasi kredit nasabah
- Tambah catatan pada pengajuan
- Update status real-time

---

## Perbedaan Akses

Role    | URL Access    | Hak Akses
--------|---------------|--------------------------------------------
Nasabah | /             | Halaman pengajuan & riwayat sendiri
Admin   | /admin/login  | Dashboard & verifikasi seluruh pengajuan

Catatan: Admin diakses langsung via URL /admin/login.

---

## Akun Demo

### Nasabah
URL: https://Glennsimbolon.github.io/capella-app

Email           | Password
----------------|----------
user@gmail.com  | user123
rina@gmail.com  | rina123
dedi@gmail.com  | dedi123
lina@gmail.com  | lina123
fajar@gmail.com | fajar123

### Admin
URL: https://Glennsimbolon.github.io/capella-app/admin/login

Email             | Password
------------------|----------
admin@capella.com | admin123

---

## Cara Menjalankan

1. Clone Repository:
   git clone https://github.com/Glennsimbolon/capella-app.git
   cd capella-app

2. Install Dependencies:
   npm install

3. Jalankan Aplikasi:
   npm run dev
