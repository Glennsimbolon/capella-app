import React, { useState } from 'react';

const ConfirmModal = ({ pengajuan, action, onClose, onConfirm }) => {
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isApprove = action === 'approve';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(catatan);
    } catch (error) {
      console.error('Error confirm:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-6 rounded-t-2xl text-white ${
          isApprove 
            ? 'bg-gradient-to-r from-emerald-600 to-green-700' 
            : 'bg-gradient-to-r from-red-600 to-rose-700'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {isApprove ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
            </h3>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">{pengajuan.id} - {pengajuan.nama}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm">
              {isApprove
                ? `Anda akan menyetujui pengajuan ini. Tindakan ini akan mengubah status menjadi "Disetujui".`
                : `Anda akan menolak pengajuan ini. Tindakan ini akan mengubah status menjadi "Ditolak".`}
            </p>
          </div>

          <div>
            <label className="input-label">
              Catatan <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                isApprove
                  ? 'Contoh: Data lengkap dan sesuai kriteria'
                  : 'Contoh: Rasio cicilan terhadap penghasilan terlalu tinggi'
              }
              rows="3"
              className="input-field textarea-field"
            />
            <p className="text-xs text-gray-400 mt-1">
              Catatan akan terlihat oleh nasabah
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 rounded-b-2xl flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={isApprove ? 'btn btn-success' : 'btn btn-danger'}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              isApprove ? 'Ya, Setujui' : 'Ya, Tolak'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;