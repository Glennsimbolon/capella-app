# Capella Multidana

> Platform pengajuan kredit digital berbasis web dengan pemisahan akses peran (Role-Based Access Control) antara Nasabah dan Admin serta pembaruan data secara real-time.

🔗 **Live Demo Application:** [https://Glennsimbolon.github.io/capella-app](https://Glennsimbolon.github.io/capella-app)

---

## 📌 Ringkasan Proyek

**Capella Multidana** adalah aplikasi pengajuan kredit berbasis web yang dirancang untuk memodernisasi proses transaksi pinjaman. Platform ini memungkinkan nasabah melakukan pengajuan pinjaman mandiri secara transparan dengan kalkulasi simulasi kredit, serta menyediakan panel verifikasi khusus bagi admin untuk mengelola pengajuan secara real-time.

---

## 🛠️ Teknologi & Stack Modern

* **Frontend Framework:** React 18 (Vite)
* **Styling & UI:** Tailwind CSS
* **Routing:** React Router DOM
* **Backend & Database:** Supabase (PostgreSQL & Realtime Subscription)
* **Deployment:** GitHub Pages

---

## ✨ Fitur Utama & Logika Bisnis

### 👤 1. Modul Nasabah (Client)
* **Autentikasi & Integrasi Data:** Login & Registrasi dengan validasi NIK unik.
* **Simulasi Angsuran Real-time:** Kalkulator otomatis hitung estimasi cicilan bulanan sebelum mengajukan.
* **Aturan Pengajuan Pinjaman:**
  * Nominal maksimal: **Rp 200.000.000**
  * Tenor maksimal: **24 Bulan**
  * Minimal penghasilan: **Rp 1.000.000**
  * Batas pengajuan: Maksimal **3 pengajuan aktif** bersamaan
* **Pelacakan Status:** Monitoring riwayat dan perubahan status pengajuan secara real-time.

### 🛡️ 2. Modul Admin (Management & Operations)
* **Dashboard Analytics:** Visualisasi data pengajuan masuk dan ringkasan statistik.
* **Workflow Verifikasi:** Fitur *Approve* atau *Reject* pengajuan pinjaman nasabah.
* **Detail Simulasi:** Memeriksa detail kalkulasi finansial dari sisi nasabah.
* **Catatan Internal:** Menambahkan catatan admin untuk setiap keputusan verifikasi.
* **Pembaruan Real-time:** Sinkronisasi status instan menggunakan fitur Supabase Realtime.

---

## 📋 Struktur Akses & Keamanan

| Role | Access URL Path | Hak Akses & Wewenang |
| :--- | :--- | :--- |
| **Nasabah** | `/` | Pengajuan kredit, kalkulator simulasi, & riwayat pribadi |
| **Admin** | `/admin/login` | Dashboard manajemen, verifikasi berkas, & audit sistem |

> 🔒 **Catatan Keamanan:** Endpoint Admin disembunyikan dari navigasi publik. Akses wajib dilakukan langsung melalui URL terproteksi `/admin/login`.

---

## 🔑 Kredensial Demo (Untuk Pengujian Rekruter)

### 👤 Akun Nasabah
Buka: `https://Glennsimbolon.github.io/capella-app`

| Email | Password | Keterangan |
| :--- | :--- | :--- |
| `user@gmail.com` | `user123` | Akun Utama Demo |
| `rina@gmail.com` | `rina123` | Akun Testing #2 |
| `dedi@gmail.com` | `dedi123` | Akun Testing #3 |

### 🛡️ Akun Admin
Buka: `https://Glennsimbolon.github.io/capella-app/admin/login`

| Email | Password | Keterangan |
| :--- | :--- | :--- |
| `admin@capella.com` | `admin123` | Full Access Admin Verifikator |

---

## 💻 Instalasi Lokal (Development)

```bash
# 1. Clone repositori
git clone [https://github.com/Glennsimbolon/capella-app.git](https://github.com/Glennsimbolon/capella-app.git)
cd capella-app

# 2. Install dependensi
npm install

# 3. Jalankan aplikasi di lokal
npm run dev
