import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatRupiah, formatDate } from '../../utils/helpers';

const DetailModal = ({ pengajuan, onClose }) => {
  const cicilan = Math.round(pengajuan.nominal / pengajuan.tenor);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Detail Pengajuan</h3>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-primary-100 text-sm">{pengajuan.id}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-3">
              Data Pribadi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">NIK</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.nik || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Nama Lengkap</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.nama}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tempat/Tgl Lahir</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.ttl || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Pekerjaan</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.pekerjaan || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400 font-medium">Alamat</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.alamat || '-'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4"></div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-3">
              Data Keuangan & Pinjaman
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Penghasilan / Bulan</p>
                <p className="text-sm font-semibold text-slate-800">{formatRupiah(pengajuan.penghasilan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tipe Pengajuan</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.tipe}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Nominal Pengajuan</p>
                <p className="text-sm font-semibold text-slate-800">{formatRupiah(pengajuan.nominal)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tenor</p>
                <p className="text-sm font-semibold text-slate-800">{pengajuan.tenor} bulan</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Cicilan / Bulan (est.)</p>
                <p className="text-sm font-semibold text-slate-800">{formatRupiah(cicilan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tanggal Pengajuan</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(pengajuan.tanggal)}</p>
              </div>
            </div>
            
            {pengajuan.catatan && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Catatan Nasabah</p>
                <p className="text-sm text-slate-700">{pengajuan.catatan}</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 my-4"></div>

          <div>
            <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-3">
              Status
            </h4>
            <div className="flex items-center gap-3">
              <StatusBadge status={pengajuan.status} />
              {pengajuan.catatanAdmin && (
                <p className="text-sm text-slate-500">
                  <span className="font-medium">Catatan Admin:</span> {pengajuan.catatanAdmin}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="btn-outline">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;