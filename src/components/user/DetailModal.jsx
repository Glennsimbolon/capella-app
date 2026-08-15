import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatRupiah, formatDate } from '../../utils/helpers';

const DetailModal = ({ pengajuan, onClose }) => {
  // 🔥 HITUNG CICILAN DENGAN BUNGA 1.5%
  const bungaPerBulan = 0.015;
  const angsuranPokok = pengajuan.nominal / pengajuan.tenor;
  const angsuranBunga = pengajuan.nominal * bungaPerBulan;
  const cicilan = Math.round(angsuranPokok + angsuranBunga);
  
  // 🔥 HITUNG TOTAL BAYAR
  const totalBayar = cicilan * pengajuan.tenor;
  const totalBunga = totalBayar - pengajuan.nominal;

  // 🔥 GENERATE JADWAL PEMBAYARAN
  const generateJadwal = () => {
    const jadwal = [];
    let sisaPokok = pengajuan.nominal;
    
    for (let i = 1; i <= pengajuan.tenor; i++) {
      const pokok = Math.round(pengajuan.nominal / pengajuan.tenor);
      const bunga = Math.round(pengajuan.nominal * bungaPerBulan);
      const angsuran = pokok + bunga;
      sisaPokok = sisaPokok - pokok;
      
      jadwal.push({
        bulan: i,
        pokok: pokok,
        bunga: bunga,
        angsuran: angsuran,
        sisaPokok: Math.max(0, sisaPokok)
      });
    }
    return jadwal;
  };

  const jadwalPembayaran = generateJadwal();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Detail Pengajuan</h3>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 text-sm">{pengajuan.id}</p>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Data Pribadi */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">
              Data Pribadi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-gray-400 font-medium">NIK</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.nik || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Nama Lengkap</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.nama}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Tempat/Tgl Lahir</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.ttl || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Pekerjaan</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.pekerjaan || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 font-medium">Alamat</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.alamat || '-'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Data Keuangan */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">
              Data Keuangan & Pinjaman
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-gray-400 font-medium">Penghasilan / Bulan</p>
                <p className="text-sm font-semibold text-gray-800">{formatRupiah(pengajuan.penghasilan)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Tipe Pengajuan</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.tipe}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Nominal Pengajuan</p>
                <p className="text-sm font-semibold text-gray-800">{formatRupiah(pengajuan.nominal)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Tenor</p>
                <p className="text-sm font-semibold text-gray-800">{pengajuan.tenor} bulan</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Cicilan / Bulan</p>
                <p className="text-sm font-semibold text-green-700">{formatRupiah(cicilan)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Tanggal Pengajuan</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(pengajuan.tanggal)}</p>
              </div>
            </div>
            
            {pengajuan.catatan && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 font-medium">Catatan Nasabah</p>
                <p className="text-sm text-gray-700">{pengajuan.catatan}</p>
              </div>
            )}
            {pengajuan.catatanAdmin && (
              <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-400 font-medium">Catatan Admin</p>
                <p className="text-sm text-gray-700">{pengajuan.catatanAdmin}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Simulasi Pembayaran */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">
              Simulasi Pembayaran
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-gray-500">Angsuran / Bulan</p>
                <p className="text-lg font-bold text-green-700">{formatRupiah(cicilan)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500">Total Pembayaran</p>
                <p className="text-lg font-bold text-blue-700">{formatRupiah(totalBayar)}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-gray-500">Total Bunga</p>
                <p className="text-lg font-bold text-amber-700">{formatRupiah(totalBunga)}</p>
              </div>
            </div>

            {/* Tabel Jadwal */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Bulan</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Pokok</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Bunga</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Angsuran</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Sisa Pokok</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalPembayaran.map((item) => (
                    <tr key={item.bulan} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-800">{item.bulan}</td>
                      <td className="px-3 py-2">{formatRupiah(item.pokok)}</td>
                      <td className="px-3 py-2">{formatRupiah(item.bunga)}</td>
                      <td className="px-3 py-2 font-medium text-green-700">{formatRupiah(item.angsuran)}</td>
                      <td className="px-3 py-2">{formatRupiah(item.sisaPokok)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">* Simulasi dengan bunga 1.5% flat per bulan</p>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">
              Status
            </h4>
            <div className="flex items-center gap-3">
              <StatusBadge status={pengajuan.status} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;