# Capella Multidana

Aplikasi pengajuan kredit digital berbasis web dengan dua peran utama: Nasabah dan Admin.

🔗 Live Demo: https://Glennsimbolon.github.io/capella-app

================================================================================
📌 TENTANG PROYEK
================================================================================
Capella Multidana adalah sistem pengajuan kredit berbasis web yang dirancang untuk
memudahkan nasabah mengajukan pinjaman secara online serta membantu admin melakukan
verifikasi secara efisien. Aplikasi ini dilengkapi dengan simulasi angsuran yang
transparan dan real-time.

================================================================================
🛠️ TEKNOLOGI
================================================================================
- Frontend           : React 18, Vite, Tailwind CSS, React Router DOM
- Backend & Database : Supabase (Database & Realtime)
- Deployment         : GitHub Pages

================================================================================
✨ FITUR UTAMA
================================================================================

[👤 Peran: Nasabah]
- Registrasi & Login : Menggunakan Email & NIK (NIK bersifat unik).
- Simulasi Angsuran  : Perhitungan pinjaman secara otomatis dan transparan.
- Pengajuan Kredit   :
  * Nominal maksimal  : Rp 200.000.000
  * Tenor maksimal    : 24 bulan
  * Minimal penghasilan: Rp 1.000.000
  * Batas pengajuan   : Maksimal 3 pengajuan aktif
- Riwayat & Status   : Pelacakan riwayat pengajuan dengan pembaruan status secara real-time.

[🛡️ Peran: Admin]
- Dashboard Statistik : Ringkasan data pengajuan secara keseluruhan.
- Verifikasi Pengajuan: Menyetujui (Approve) atau menolak (Reject) pengajuan nasabah.
- Detail Simulasi     : Melihat kalkulasi dan simulasi kredit nasabah.
- Catatan Admin       : Menambahkan catatan khusus pada tiap pengajuan.
- Real-time Update    : Pembaruan status pengajuan secara langsung.

================================================================================
📋 PERBEDAAN AKSES
================================================================================
Role    | URL Akses         | Hak Akses
--------+-------------------+---------------------------------------------------
Nasabah | /                 | Halaman pengajuan & riwayat transaksi pribadi
Admin   | /admin/login      | Dashboard admin & seluruh pengajuan nasabah

⚠️ Catatan Penting: Halaman admin sengaja disembunyikan dari navigasi umum. 
Admin wajib mengakses sistem secara langsung melalui URL khusus admin (/admin/login).

================================================================================
🔑 AKUN DEMO
================================================================================

[👤 Akun Nasabah]
Langkah Login:
1. Buka https://Glennsimbolon.github.io/capella-app
2. Masukkan salah satu kredensial di bawah ini, lalu klik "Masuk".

Email               | Password
--------------------+------------------
user@gmail.com      | user123
rina@gmail.com      | rina123
dedi@gmail.com      | dedi123
lina@gmail.com      | lina123
fajar@gmail.com     | fajar123

[🛡️ Akun Admin]
Langkah Login:
1. Akses halaman https://Glennsimbolon.github.io/capella-app/admin/login
2. Masukkan kredensial admin di bawah ini, lalu klik "Masuk sebagai Admin".

Email               | Password
--------------------+------------------
admin@capella.com   | admin123

================================================================================
🚀 CARA MENJALANKAN DI LOKAL (DEVELOPMENT)
================================================================================

1. Clone Repository:
   git clone https://github.com/Glennsimbolon/capella-app.git
   cd capella-app

2. Install Dependensi:
   npm install

3. Jalankan Aplikasi:
   npm run dev
