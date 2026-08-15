import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { showToast } from '../common/Toast';
import { registerUser } from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nama: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    pekerjaan: '',
    penghasilan: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const daftarPekerjaan = [
    'Karyawan Swasta',
    'Pegawai Negeri Sipil (PNS)',
    'TNI / Polri',
    'Wiraswasta / Pengusaha',
    'Profesional (Dokter, Pengacara, dll)',
    'Guru / Dosen',
    'Karyawan BUMN',
    'Karyawan Perbankan',
    'Karyawan Asuransi',
    'Karyawan Perusahaan Asing',
    'Karyawan Kontrak',
    'Buruh / Pekerja Lepas',
    'Petani / Nelayan',
    'Ibu Rumah Tangga',
    'Mahasiswa / Pelajar',
    'Pensiunan',
    'Lainnya'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});
    const newErrors = {};

    // Validasi Email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid (contoh: nama@gmail.com)';
    }

    // Validasi Password
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama';
    }

    // Validasi Nama
    if (!formData.nama || formData.nama.trim() === '') {
      newErrors.nama = 'Nama lengkap wajib diisi';
    }

    // Validasi NIK
    if (!formData.nik || formData.nik.trim() === '') {
      newErrors.nik = 'NIK wajib diisi';
    } else if (!/^\d{16}$/.test(formData.nik)) {
      newErrors.nik = 'NIK harus 16 digit angka';
    }

    // Validasi Tempat Lahir
    if (!formData.tempat_lahir || formData.tempat_lahir.trim() === '') {
      newErrors.tempat_lahir = 'Tempat lahir wajib diisi';
    }

    // Validasi Tanggal Lahir
    if (!formData.tanggal_lahir) {
      newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }

    // Validasi Alamat
    if (!formData.alamat || formData.alamat.trim() === '') {
      newErrors.alamat = 'Alamat wajib diisi';
    }

    // Validasi Pekerjaan
    if (!formData.pekerjaan || formData.pekerjaan.trim() === '') {
      newErrors.pekerjaan = 'Pekerjaan wajib diisi';
    }

    // Validasi Penghasilan
    if (!formData.penghasilan || formData.penghasilan < 1000000) {
      newErrors.penghasilan = 'Penghasilan minimal Rp 1.000.000';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Mohon lengkapi data dengan benar', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Gabungkan tempat dan tanggal lahir
      const tanggalFormat = new Date(formData.tanggal_lahir).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const ttlValue = `${formData.tempat_lahir}, ${tanggalFormat}`;

      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        nama: formData.nama,
        nik: formData.nik,
        ttl: ttlValue,
        alamat: formData.alamat,
        pekerjaan: formData.pekerjaan,
        penghasilan: Number(formData.penghasilan)
      });

      if (result.success) {
        showToast('Registrasi berhasil!', 'success');
        
        const loginResult = await login(formData.email, formData.password, 'user');
        if (loginResult.success) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        showToast(result.error || 'Gagal registrasi', 'error');
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Register error:', error);
      showToast('Terjadi kesalahan saat registrasi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border border-white/30">
              CM
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Daftar Akun</h1>
          <p className="text-blue-100 text-sm">Capella Multidana</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Akun Login */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-2">
                  Akun Login
                </h4>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email (Gmail) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@gmail.com"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                <p className="text-xs text-gray-400 mt-1">Gunakan email aktif untuk login</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Data Pribadi */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-2 mt-2">
                  Data Pribadi
                </h4>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.nama ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.nama && <p className="mt-1 text-xs text-red-600">{errors.nama}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  NIK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="16 digit NIK"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.nik ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.nik && <p className="mt-1 text-xs text-red-600">{errors.nik}</p>}
                <p className="text-xs text-red-500 mt-1">⚠️ NIK tidak boleh digunakan 2x</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleChange}
                  placeholder="Contoh: Bandung"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.tempat_lahir ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.tempat_lahir && <p className="mt-1 text-xs text-red-600">{errors.tempat_lahir}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.tanggal_lahir ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.tanggal_lahir && <p className="mt-1 text-xs text-red-600">{errors.tanggal_lahir}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat lengkap"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.alamat ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.alamat && <p className="mt-1 text-xs text-red-600">{errors.alamat}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Pekerjaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.pekerjaan ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                >
                  <option value="">-- Pilih Pekerjaan --</option>
                  {daftarPekerjaan.map((job) => (
                    <option key={job} value={job}>{job}</option>
                  ))}
                </select>
                {errors.pekerjaan && <p className="mt-1 text-xs text-red-600">{errors.pekerjaan}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Penghasilan Bulanan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="penghasilan"
                  value={formData.penghasilan}
                  onChange={handleChange}
                  placeholder="Minimal 1.000.000"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.penghasilan ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300`}
                />
                {errors.penghasilan && <p className="mt-1 text-xs text-red-600">{errors.penghasilan}</p>}
                <p className="text-xs text-gray-400 mt-1">Minimal Rp 1.000.000</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Mendaftar...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;