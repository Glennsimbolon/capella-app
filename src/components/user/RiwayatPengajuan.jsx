import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StatusBadge from '../common/StatusBadge';
import { getPengajuanByUserId, subscribePengajuanByUser } from '../../services/supabase';
import { formatRupiah, formatDateShort } from '../../utils/helpers';
import { showToast } from '../common/Toast';

const RiwayatPengajuan = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getPengajuanByUserId(user.id);
      setPengajuanList(list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)));
    } catch (error) {
      console.error('Error loading riwayat:', error);
      showToast('Gagal memuat riwayat', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();

    // ===== REALTIME SUBSCRIPTION =====
    // Subscribe ke perubahan pengajuan untuk user ini
    const channel = subscribePengajuanByUser(user.id, (payload) => {
      console.log('Realtime update received:', payload);
      
      // Update data secara realtime
      if (payload.eventType === 'INSERT') {
        // Pengajuan baru ditambahkan
        setPengajuanList(prev => [payload.new, ...prev]);
        showToast('Pengajuan baru ditambahkan!', 'info');
      } else if (payload.eventType === 'UPDATE') {
        // Status pengajuan diupdate (admin approve/reject)
        setPengajuanList(prev => 
          prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          )
        );
        // Tampilkan notifikasi jika status berubah
        if (payload.old.status !== payload.new.status) {
          showToast(`Status pengajuan ${payload.new.id} berubah menjadi ${payload.new.status}`, 'info');
        }
      } else if (payload.eventType === 'DELETE') {
        // Pengajuan dihapus
        setPengajuanList(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    // Cleanup subscription saat komponen unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="spinner mx-auto mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-500 font-medium">Memuat riwayat...</p>
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
            <h2 className="text-3xl font-bold text-gray-800">Riwayat Pengajuan</h2>
            <p className="text-gray-500">{pengajuanList.length} pengajuan tercatat</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary flex items-center gap-2"
          >
            Kembali
          </button>
        </div>

        {pengajuanList.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Pengajuan</h3>
            <p className="text-gray-500">Ajukan pinjaman pertama Anda sekarang</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary mt-4 inline-flex items-center gap-2"
            >
              Ajukan Pinjaman
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipe</th>
                    <th>Nominal</th>
                    <th>Tenor</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pengajuanList.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium text-gray-800">{p.id}</td>
                      <td>
                        <span className="badge badge-tipe">{p.tipe}</span>
                      </td>
                      <td className="font-medium">{formatRupiah(p.nominal)}</td>
                      <td>{p.tenor} bln</td>
                      <td className="text-gray-500 text-sm">{formatDateShort(p.tanggal)}</td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RiwayatPengajuan;