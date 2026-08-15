import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StatusBadge from '../common/StatusBadge';
import ConfirmModal from './ConfirmModal';
import DetailModal from './DetailModal';
import { getPengajuan, approvePengajuan, rejectPengajuan, subscribePengajuan } from '../../services/supabase';
import { formatRupiah, formatDateShort, calculateCicilan } from '../../utils/helpers';
import { showToast } from '../common/Toast';

const VerifikasiPengajuan = () => {
  const { user } = useAuthContext();
  const [pengajuanList, setPengajuanList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const loadPengajuan = useCallback(async () => {
    setLoading(true);
    try {
      const allPengajuan = await getPengajuan();
      setPengajuanList(allPengajuan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
    } catch (error) {
      console.error('Error loading pengajuan:', error);
      showToast('Gagal memuat data pengajuan', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login';
      return;
    }
    loadPengajuan();

    const channel = subscribePengajuan((payload) => {
      console.log('Verifikasi Realtime update:', payload);
      
      if (payload.eventType === 'INSERT') {
        setPengajuanList(prev => [payload.new, ...prev]);
        showToast(`Pengajuan baru dari ${payload.new.nama}`, 'info');
      } else if (payload.eventType === 'UPDATE') {
        setPengajuanList(prev => 
          prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          )
        );
        if (payload.old.status !== payload.new.status) {
          showToast(`Status pengajuan ${payload.new.id} berubah menjadi ${payload.new.status}`, 'info');
        }
      } else if (payload.eventType === 'DELETE') {
        setPengajuanList(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user, loadPengajuan]);

  const getFilteredList = () => {
    if (filterStatus === 'Semua') return pengajuanList;
    return pengajuanList.filter(p => p.status === filterStatus);
  };

  const handleViewDetail = (pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setShowDetailModal(true);
  };

  const handleAction = (pengajuan, action) => {
    setSelectedPengajuan(pengajuan);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirm = async (catatan) => {
    if (!selectedPengajuan) return;

    try {
      let result;
      if (confirmAction === 'approve') {
        result = await approvePengajuan(selectedPengajuan.id, catatan);
      } else {
        result = await rejectPengajuan(selectedPengajuan.id, catatan);
      }

      if (result.success) {
        showToast(`Pengajuan ${selectedPengajuan.id} ${confirmAction === 'approve' ? 'disetujui' : 'ditolak'}`, 'success');
        loadPengajuan();
      } else {
        showToast(result.error || 'Gagal memproses pengajuan', 'error');
      }
    } catch (error) {
      console.error('Error processing action:', error);
      showToast('Terjadi kesalahan saat memproses pengajuan', 'error');
    } finally {
      setShowConfirmModal(false);
      setSelectedPengajuan(null);
      setConfirmAction(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getSimulasi = (pengajuan) => {
    const bungaPerBulan = 0.015;
    const angsuranPokok = pengajuan.nominal / pengajuan.tenor;
    const angsuranBunga = pengajuan.nominal * bungaPerBulan;
    const angsuranPerBulan = Math.round(angsuranPokok + angsuranBunga);
    const totalBayar = angsuranPerBulan * pengajuan.tenor;
    const totalBunga = totalBayar - pengajuan.nominal;
    const persentasePenghasilan = pengajuan.penghasilan > 0 ? (angsuranPerBulan / pengajuan.penghasilan) * 100 : 0;

    return {
      angsuranPerBulan,
      totalBayar,
      totalBunga,
      persentasePenghasilan,
      angsuranPokok: Math.round(angsuranPokok),
      angsuranBunga: Math.round(angsuranBunga)
    };
  };

  const filteredList = getFilteredList();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="spinner mx-auto mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-500 font-medium">Memuat data pengajuan...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Verifikasi Pengajuan</h2>
            <p className="text-gray-500">{filteredList.length} data ditampilkan</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.href = '/admin/dashboard'} 
              className="btn btn-secondary flex items-center gap-2"
            >
              Kembali
            </button>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="input-field w-40"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak Ada Data</h3>
            <p className="text-gray-500">Tidak ada pengajuan dengan status ini</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-10"></th>
                    <th>ID</th>
                    <th>Nasabah</th>
                    <th>Pekerjaan</th>
                    <th>Tipe</th>
                    <th>Gaji / Bulan</th>
                    <th>Nominal</th>
                    <th>Tenor</th>
                    <th>Angsuran / Bulan</th>
                    <th>% Gaji</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((p) => {
                    const simulasi = getSimulasi(p);
                    const isExpanded = expandedRow === p.id;
                    const statusColor = 
                      simulasi.persentasePenghasilan > 40 ? 'bg-red-100 text-red-700' :
                      simulasi.persentasePenghasilan > 30 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700';
                    
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="px-2 py-3">
                            <button
                              onClick={() => toggleExpand(p.id)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              {isExpanded ? '▲' : '▼'}
                            </button>
                          </td>
                          <td className="font-medium text-gray-800">{p.id}</td>
                          <td className="font-medium">{p.nama}</td>
                          <td className="text-gray-600 text-sm">{p.pekerjaan || '-'}</td>
                          <td><span className="badge badge-tipe">{p.tipe}</span></td>
                          <td className="font-medium text-blue-700">{formatRupiah(p.penghasilan)}</td>
                          <td className="font-medium">{formatRupiah(p.nominal)}</td>
                          <td>{p.tenor} bln</td>
                          <td className="font-medium text-green-700">{formatRupiah(simulasi.angsuranPerBulan)}</td>
                          <td>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                              {simulasi.persentasePenghasilan.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-gray-500 text-sm">{formatDateShort(p.tanggal)}</td>
                          <td><StatusBadge status={p.status} /></td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              <button 
                                onClick={() => handleViewDetail(p)} 
                                className="btn btn-secondary btn-sm flex items-center gap-1"
                              >
                                Detail
                              </button>
                              {p.status === 'Menunggu' && (
                                <>
                                  <button 
                                    onClick={() => handleAction(p, 'approve')} 
                                    className="btn btn-success btn-sm flex items-center gap-1"
                                  >
                                    Setujui
                                  </button>
                                  <button 
                                    onClick={() => handleAction(p, 'reject')} 
                                    className="btn btn-danger btn-sm flex items-center gap-1"
                                  >
                                    Tolak
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr>
                            <td colSpan="13" className="px-4 py-4 bg-blue-50/50">
                              <div className="border border-blue-200 rounded-xl p-4 bg-white">
                                <h4 className="text-sm font-semibold text-blue-800 mb-3">
                                  📊 Simulasi Kredit - {p.nama}
                                </h4>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Nama</p>
                                    <p className="text-sm font-semibold">{p.nama}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Pekerjaan</p>
                                    <p className="text-sm font-semibold">{p.pekerjaan || '-'}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Penghasilan / Bulan</p>
                                    <p className="text-sm font-semibold text-blue-700">{formatRupiah(p.penghasilan)}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Alamat</p>
                                    <p className="text-sm font-semibold">{p.alamat || '-'}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-xs text-gray-500">Nominal Pinjaman</p>
                                    <p className="text-sm font-bold text-blue-700">{formatRupiah(p.nominal)}</p>
                                  </div>
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-xs text-gray-500">Tenor</p>
                                    <p className="text-sm font-bold text-blue-700">{p.tenor} bulan</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <p className="text-xs text-gray-500">Angsuran / Bulan</p>
                                    <p className="text-sm font-bold text-green-700">{formatRupiah(simulasi.angsuranPerBulan)}</p>
                                  </div>
                                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    <p className="text-xs text-gray-500">Total Bunga</p>
                                    <p className="text-sm font-bold text-amber-700">{formatRupiah(simulasi.totalBunga)}</p>
                                  </div>
                                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                    <p className="text-xs text-gray-500">Total Pembayaran</p>
                                    <p className="text-sm font-bold text-purple-700">{formatRupiah(simulasi.totalBayar)}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Pokok Pinjaman / Bulan</p>
                                    <p className="text-sm font-semibold">{formatRupiah(simulasi.angsuranPokok)}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Bunga / Bulan (1.5%)</p>
                                    <p className="text-sm font-semibold">{formatRupiah(simulasi.angsuranBunga)}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Rasio Angsuran / Gaji</p>
                                    <p className={`text-sm font-bold ${
                                      simulasi.persentasePenghasilan > 40 ? 'text-red-600' :
                                      simulasi.persentasePenghasilan > 30 ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`}>
                                      {simulasi.persentasePenghasilan.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>

                                <div className={`p-3 rounded-lg ${
                                  simulasi.persentasePenghasilan > 40 
                                    ? 'bg-red-100 border border-red-300' 
                                    : simulasi.persentasePenghasilan > 30 
                                      ? 'bg-yellow-100 border border-yellow-300' 
                                      : 'bg-green-100 border border-green-300'
                                }`}>
                                  <p className="text-sm font-medium">
                                    {simulasi.persentasePenghasilan > 40 
                                      ? '⚠️ Risiko Tinggi: Angsuran melebihi 40% dari penghasilan' 
                                      : simulasi.persentasePenghasilan > 30 
                                        ? '⚠️ Perhatian: Angsuran antara 30-40% dari penghasilan' 
                                        : '✅ Aman: Angsuran di bawah 30% dari penghasilan'}
                                  </p>
                                </div>

                                {p.status === 'Menunggu' && (
                                  <div className="mt-4 flex gap-2">
                                    <button 
                                      onClick={() => handleAction(p, 'approve')} 
                                      className="btn btn-success btn-sm"
                                    >
                                      ✅ Setujui Pengajuan
                                    </button>
                                    <button 
                                      onClick={() => handleAction(p, 'reject')} 
                                      className="btn btn-danger btn-sm"
                                    >
                                      ❌ Tolak Pengajuan
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {showDetailModal && selectedPengajuan && (
        <DetailModal 
          pengajuan={selectedPengajuan} 
          onClose={() => { 
            setShowDetailModal(false); 
            setSelectedPengajuan(null); 
          }} 
        />
      )}

      {showConfirmModal && selectedPengajuan && (
        <ConfirmModal
          pengajuan={selectedPengajuan}
          action={confirmAction}
          onClose={() => { 
            setShowConfirmModal(false); 
            setSelectedPengajuan(null); 
            setConfirmAction(null); 
          }}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default VerifikasiPengajuan;