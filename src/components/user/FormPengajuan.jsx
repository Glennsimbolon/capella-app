import React, { useState, useEffect } from 'react';
import { submitPengajuan } from '../../services/pengajuanService';
import { showToast } from '../common/Toast';
import { TIPE_PENGAJUAN } from '../../utils/constants';
import { formatRupiah } from '../../utils/helpers';

const FormPengajuan = ({ user, activeCount, onSuccess }) => {
  const [formData, setFormData] = useState({
    nik: user?.nik || '',
    nama: user?.nama || '',
    tempat_lahir: user?.tempat_lahir || '',
    tanggal_lahir: user?.tanggal_lahir || '',
    alamat: user?.alamat || '',
    pekerjaan: user?.pekerjaan || 'Karyawan Swasta',
    penghasilan: user?.penghasilan || '',
    tipe: TIPE_PENGAJUAN.MOTOR,
    nominal: '',
    tenor: '',
    catatan: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [simulasi, setSimulasi] = useState({
    angsuranPerBulan: 0,
    totalBayar: 0,
    bunga: 0,
    persentasePenghasilan: 0
  });

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

  // Fungsi format angka dengan titik separator
  const formatNumber = (value) => {
    const strValue = String(value || '');
    const cleanValue = strValue.replace(/\D/g, '');
    if (!cleanValue) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanValue));
  };

  const unformatNumber = (value) => {
    const strValue = String(value || '');
    return strValue.replace(/\./g, '');
  };

  const hitungSimulasi = () => {
    const nominalRaw = String(formData.nominal || '');
    const tenorRaw = String(formData.tenor || '');
    const penghasilanRaw = String(formData.penghasilan || '');

    const nominalValue = parseInt(unformatNumber(nominalRaw)) || 0;
    const tenorValue = parseInt(tenorRaw) || 0;
    const penghasilanValue = parseInt(unformatNumber(penghasilanRaw)) || 0;

    if (nominalValue > 0 && tenorValue > 0) {
      const bungaPerBulan = 0.015;
      const angsuranPokok = nominalValue / tenorValue;
      const angsuranBunga = nominalValue * bungaPerBulan;
      const angsuranPerBulan = Math.round(angsuranPokok + angsuranBunga);
      const totalBayar = angsuranPerBulan * tenorValue;
      const totalBunga = totalBayar - nominalValue;
      const persentasePenghasilan = penghasilanValue > 0 ? (angsuranPerBulan / penghasilanValue) * 100 : 0;

      setSimulasi({
        angsuranPerBulan,
        totalBayar,
        bunga: totalBunga,
        persentasePenghasilan
      });
    } else {
      setSimulasi({
        angsuranPerBulan: 0,
        totalBayar: 0,
        bunga: 0,
        persentasePenghasilan: 0
      });
    }
  };

  useEffect(() => {
    hitungSimulasi();
  }, [formData.nominal, formData.tenor, formData.penghasilan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nominal' || name === 'penghasilan') {
      const rawValue = value.replace(/\./g, '');
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        const formattedValue = formatNumber(rawValue);
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});
    const newErrors = {};
    
    const penghasilanValue = formData.penghasilan ? parseInt(unformatNumber(formData.penghasilan)) : 0;
    if (!penghasilanValue || penghasilanValue < 1000000) {
      newErrors.penghasilan = 'Nasabah belum dapat mengajukan pinjaman (Penghasilan minimal Rp 1.000.000)';
      showToast('Nasabah belum dapat mengajukan pinjaman', 'error');
      setErrors(newErrors);
      return;
    }
    
    const nominalValue = formData.nominal ? parseInt(unformatNumber(formData.nominal)) : 0;
    if (!nominalValue || nominalValue <= 0) {
      newErrors.nominal = 'Nominal pengajuan wajib diisi';
    } else if (nominalValue > 200000000) {
      newErrors.nominal = 'Nominal maksimal Rp 200.000.000';
      showToast('Nominal maksimal Rp 200.000.000', 'error');
      setErrors(newErrors);
      return;
    }
    
    const tenorValue = parseInt(formData.tenor);
    if (!tenorValue || tenorValue <= 0) {
      newErrors.tenor = 'Tenor wajib diisi';
    } else if (tenorValue > 24) {
      newErrors.tenor = 'Tenor maksimal 24 bulan';
      showToast('Tenor maksimal 24 bulan', 'error');
      setErrors(newErrors);
      return;
    }

    // 🔥 VALIDASI RASIO ANGSURAN (MAKSIMAL 40% DARI PENGHASILAN)
    const bungaPerBulan = 0.015;
    const angsuranPokok = nominalValue / tenorValue;
    const angsuranBunga = nominalValue * bungaPerBulan;
    const angsuranPerBulan = Math.round(angsuranPokok + angsuranBunga);
    const rasioAngsuran = (angsuranPerBulan / penghasilanValue) * 100;

    if (rasioAngsuran > 40) {
      const maxAngsuran = Math.round(penghasilanValue * 0.4);
      newErrors.nominal = `Angsuran (${formatRupiah(angsuranPerBulan)}) melebihi 40% dari penghasilan (${formatRupiah(penghasilanValue)}). Maksimal angsuran ${formatRupiah(maxAngsuran)}.`;
      showToast(`Angsuran melebihi 40% dari penghasilan! Maksimal ${formatRupiah(maxAngsuran)}`, 'error');
      setErrors(newErrors);
      return;
    }
    
    if (activeCount >= 3) {
      newErrors.global = 'Maksimal 3 pengajuan aktif';
      showToast('Maksimal 3 pengajuan aktif', 'error');
      setErrors(newErrors);
      return;
    }
    
    if (!formData.nik || formData.nik.trim() === '') {
      newErrors.nik = 'NIK wajib diisi';
    }
    if (!formData.nama || formData.nama.trim() === '') {
      newErrors.nama = 'Nama lengkap wajib diisi';
    }
    if (!formData.tempat_lahir || formData.tempat_lahir.trim() === '') {
      newErrors.tempat_lahir = 'Tempat lahir wajib diisi';
    }
    if (!formData.tanggal_lahir) {
      newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }
    if (!formData.pekerjaan || formData.pekerjaan.trim() === '') {
      newErrors.pekerjaan = 'Pekerjaan wajib diisi';
    }
    if (!formData.alamat || formData.alamat.trim() === '') {
      newErrors.alamat = 'Alamat wajib diisi';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (!newErrors.penghasilan && !newErrors.nominal && !newErrors.tenor && !newErrors.global) {
        showToast('Mohon lengkapi data dengan benar', 'error');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const tanggalFormat = new Date(formData.tanggal_lahir).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const ttlValue = `${formData.tempat_lahir}, ${tanggalFormat}`;

      const dataToSubmit = {
        nik: formData.nik,
        nama: formData.nama,
        ttl: ttlValue,
        alamat: formData.alamat,
        pekerjaan: formData.pekerjaan,
        penghasilan: penghasilanValue,
        tipe: formData.tipe,
        nominal: nominalValue,
        tenor: tenorValue,
        catatan: formData.catatan || '',
        userId: user.id,
        angsuran: simulasi.angsuranPerBulan
      };

      const result = await submitPengajuan(dataToSubmit);

      if (result.success) {
        showToast('Pengajuan berhasil dikirim!', 'success');
        setFormData(prev => ({
          ...prev,
          tipe: TIPE_PENGAJUAN.MOTOR,
          nominal: '',
          tenor: '',
          catatan: ''
        }));
        setSimulasi({
          angsuranPerBulan: 0,
          totalBayar: 0,
          bunga: 0,
          persentasePenghasilan: 0
        });
        onSuccess(true);
      } else {
        showToast(result.error || 'Gagal mengirim pengajuan', 'error');
      }
    } catch (error) {
      console.error('Error submit:', error);
      showToast('Terjadi kesalahan saat mengirim pengajuan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Form Pengajuan Kredit
      </h3>

      {activeCount >= 3 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          <p className="font-semibold">⚠️ Batas Pengajuan Aktif</p>
          <p>Anda sudah memiliki {activeCount} pengajuan aktif. Maksimal 3 pengajuan aktif diperbolehkan.</p>
        </div>
      )}

      {errors.global && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-2">
              Data Pribadi
            </h4>
          </div>

          <div>
            <label className="input-label">NIK <span className="text-red-500">*</span></label>
            <input type="text" name="nik" value={formData.nik} onChange={handleChange} placeholder="Masukkan NIK" className={`input-field ${errors.nik ? 'input-field-error' : ''}`} />
            {errors.nik && <p className="input-error">{errors.nik}</p>}
          </div>

          <div>
            <label className="input-label">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Masukkan nama lengkap" className={`input-field ${errors.nama ? 'input-field-error' : ''}`} />
            {errors.nama && <p className="input-error">{errors.nama}</p>}
          </div>

          <div>
            <label className="input-label">Tempat Lahir <span className="text-red-500">*</span></label>
            <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} placeholder="Contoh: Bandung" className={`input-field ${errors.tempat_lahir ? 'input-field-error' : ''}`} />
            {errors.tempat_lahir && <p className="input-error">{errors.tempat_lahir}</p>}
          </div>

          <div>
            <label className="input-label">Tanggal Lahir <span className="text-red-500">*</span></label>
            <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className={`input-field ${errors.tanggal_lahir ? 'input-field-error' : ''}`} />
            {errors.tanggal_lahir && <p className="input-error">{errors.tanggal_lahir}</p>}
          </div>

          <div>
            <label className="input-label">Pekerjaan <span className="text-red-500">*</span></label>
            <select name="pekerjaan" value={formData.pekerjaan} onChange={handleChange} className={`input-field ${errors.pekerjaan ? 'input-field-error' : ''}`}>
              <option value="">-- Pilih Pekerjaan --</option>
              {daftarPekerjaan.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
            {errors.pekerjaan && <p className="input-error">{errors.pekerjaan}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="input-label">Alamat <span className="text-red-500">*</span></label>
            <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Alamat lengkap" className={`input-field ${errors.alamat ? 'input-field-error' : ''}`} />
            {errors.alamat && <p className="input-error">{errors.alamat}</p>}
          </div>

          <div>
            <label className="input-label">Penghasilan Bulanan (Rp) <span className="text-red-500">*</span></label>
            <input type="text" name="penghasilan" value={formData.penghasilan} onChange={handleChange} placeholder="Contoh: 5.000.000" className={`input-field ${errors.penghasilan ? 'input-field-error' : ''}`} />
            {errors.penghasilan && <p className="input-error text-red-600 font-semibold">⚠️ {errors.penghasilan}</p>}
            <p className="text-xs text-gray-400 mt-1">Minimal Rp 1.000.000</p>
          </div>

          <div className="md:col-span-2 mt-2">
            <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b border-gray-200 pb-2">Data Pengajuan</h4>
          </div>

          <div>
            <label className="input-label">Tipe Pengajuan</label>
            <select name="tipe" value={formData.tipe} onChange={handleChange} className="input-field">
              <option value={TIPE_PENGAJUAN.MOTOR}>Motor</option>
              <option value={TIPE_PENGAJUAN.MOBIL}>Mobil</option>
              <option value={TIPE_PENGAJUAN.MULTIGUNA}>Multiguna</option>
            </select>
          </div>

          <div>
            <label className="input-label">Nominal Pengajuan (Rp) <span className="text-red-500">*</span></label>
            <input type="text" name="nominal" value={formData.nominal} onChange={handleChange} placeholder="Contoh: 25.000.000" className={`input-field ${errors.nominal ? 'input-field-error' : ''}`} />
            {errors.nominal && <p className="input-error">{errors.nominal}</p>}
            <p className="text-xs text-gray-400 mt-1">Maksimal Rp 200.000.000</p>
          </div>

          <div>
            <label className="input-label">Tenor (bulan) <span className="text-red-500">*</span></label>
            <input type="number" name="tenor" value={formData.tenor} onChange={handleChange} placeholder="Maksimal 24 bulan" className={`input-field ${errors.tenor ? 'input-field-error' : ''}`} />
            {errors.tenor && <p className="input-error">{errors.tenor}</p>}
            <p className="text-xs text-gray-400 mt-1">Maksimal 24 bulan</p>
          </div>

          <div className="md:col-span-2">
            <label className="input-label">Catatan (opsional)</label>
            <textarea name="catatan" value={formData.catatan} onChange={handleChange} placeholder="Tujuan penggunaan dana, dll." rows="3" className="input-field" />
          </div>

          {simulasi.angsuranPerBulan > 0 && (
            <div className="md:col-span-2 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">📊 Simulasi Kredit</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-500">Angsuran / Bulan</p>
                  <p className="text-lg font-bold text-blue-700">{formatRupiah(simulasi.angsuranPerBulan)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-500">Total Pembayaran</p>
                  <p className="text-lg font-bold text-blue-700">{formatRupiah(simulasi.totalBayar)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-500">Total Bunga</p>
                  <p className="text-lg font-bold text-amber-600">{formatRupiah(simulasi.bunga)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-500">% dari Penghasilan</p>
                  <p className={`text-lg font-bold ${simulasi.persentasePenghasilan > 40 ? 'text-red-600' : 'text-green-600'}`}>
                    {simulasi.persentasePenghasilan.toFixed(1)}%
                  </p>
                  {simulasi.persentasePenghasilan > 40 && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Melebihi 40% dari penghasilan</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">* Simulasi dengan bunga 1.5% flat per bulan</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isSubmitting || activeCount >= 3} className="btn btn-primary flex items-center gap-2">
            {isSubmitting ? <><span className="spinner"></span> Mengirim...</> : 'Kirim Pengajuan'}
          </button>
          <button type="button" onClick={() => onSuccess(false)} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
};

export default FormPengajuan;