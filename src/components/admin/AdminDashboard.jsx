import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StatsCard from '../common/StatsCard';
import StatusBadge from '../common/StatusBadge';
import FormPengajuan from './FormPengajuan';
import { getUserStats, getActivePengajuanCount, getPengajuanByUserId, subscribePengajuanByUser } from '../../services/supabase';
import { supabase } from '../../services/supabase';
import { formatRupiah, formatDateShort } from '../../utils/helpers';
import { showToast } from '../common/Toast';

const UserDashboard = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    disetujui: 0,
    ditolak: 0,
    menunggu: 0
  });
  const [activeCount, setActiveCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [recentPengajuan, setRecentPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null); // <-- State untuk notifikasi popup

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const userStats = await getUserStats(user.id);
      setStats(userStats);
      const count = await getActivePengajuanCount(user.id);
      setActiveCount(count);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user]);

  const loadRecentPengajuan = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getPengajuanByUserId(user.id);
      setRecentPengajuan(
        list
          .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error loading recent:', error);
    }
  }, [user]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadRecentPengajuan()]);
    setLoading(false);
  }, [loadStats, loadRecentPengajuan]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAllData();

    // ===== REALTIME SUBSCRIPTION =====
    const channel = subscribePengajuanByUser(user.id, (payload) => {
      console.log('🔔 Realtime update received:', payload);
      
      if (payload.eventType === 'INSERT') {
        // Pengajuan baru
        setRecentPengajuan(prev => [payload.new, ...prev.slice(0, 4)]);
        loadStats();
        showToast('Pengajuan baru berhasil dikirim!', 'success');
      } else if (payload.eventType === 'UPDATE') {
        // 🔥 STATUS BERUBAH → POPUP NOTIFIKASI!
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;
        
        if (oldStatus !== newStatus) {
          // Update data
          setRecentPengajuan(prev => 
            prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            )
          );
          loadStats();

          // 🔔 TAMPILKAN POPUP NOTIFIKASI
          if (newStatus === 'Disetujui') {
            setNotif({
              type: 'success',
              title: '🎉 Pengajuan Disetujui!',
              message: `Pengajuan ${payload.new.id} Anda telah disetujui oleh admin.`,
              id: payload.new.id
            });
            showToast(`🎉 Pengajuan ${payload.new.id} telah disetujui!`, 'success');
          } else if (newStatus === 'Ditolak') {
            setNotif({
              type: 'error',
              title: '❌ Pengajuan Ditolak',
              message: `Pengajuan ${payload.new.id} Anda ditolak. Cek catatan admin untuk detail.`,
              id: payload.new.id,
              catatanAdmin: payload.new.catatan_admin
            });
            showToast(`❌ Pengajuan ${payload.new.id} ditolak`, 'error');
          }
        }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadAllData, loadStats]);

  // ===== POPUP NOTIFIKASI =====
  const NotifikasiPopup = ({ notif, onClose }) => {
    if (!notif) return null;

    const isSuccess = notif.type === 'success';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-center ${
            isSuccess 
              ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="text-5xl mb-2">{isSuccess ? '🎉' : '❌'}</div>
            <h3 className="text-xl font-bold text-white">{notif.title}</h3>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 text-center mb-4">{notif.message}</p>
            
            {notif.catatanAdmin && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <p className="text-xs text-gray-400 font-medium">Catatan Admin:</p>
                <p className="text-sm text-gray-700">{notif.catatanAdmin}</p>
              </div>
            )}

            <div className="text-center text-xs text-gray-400">
              ID Pengajuan: {notif.id}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 text-center">
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="spinner mx-auto mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-500 font-medium">Memuat dashboard...</p>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Selamat Datang, {user?.nama}
          </h2>
          <p className="text-gray-500">
            Kelola pengajuan kredit Anda dengan mudah
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label="Total Pengajuan"
            value={stats.total}
            icon="📄"
            color="blue"
          />
          <StatsCard
            label="Disetujui"
            value={stats.disetujui}
            icon="✅"
            color="green"
          />
          <StatsCard
            label="Ditolak"
            value={stats.ditolak}
            icon="❌"
            color="red"
          />
          <StatsCard
            label="Menunggu"
            value={stats.menunggu}
            icon="⏳"
            color="yellow"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            {showForm ? 'Tutup Form' : 'Ajukan Pinjaman Baru'}
          </button>
          
          <button
            onClick={() => navigate('/riwayat')}
            className="btn btn-secondary flex items-center gap-2"
          >
            Lihat Riwayat
          </button>
        </div>

        {showForm && (
          <div className="mb-8 animate-fade-in">
            <FormPengajuan 
              user={user} 
              activeCount={activeCount}
              onSuccess={() => {
                loadAllData();
                setShowForm(false);
              }}
            />
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Pengajuan Terbaru
            </h3>
            <button
              onClick={() => navigate('/riwayat')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Lihat Semua →
            </button>
          </div>
          
          {recentPengajuan.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada pengajuan. Ajukan pinjaman pertama Anda!
            </p>
          ) : (
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
                  {recentPengajuan.map((p) => (
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
          )}
        </div>
      </main>

      <Footer />

      {/* ===== POPUP NOTIFIKASI ===== */}
      <NotifikasiPopup 
        notif={notif} 
        onClose={() => setNotif(null)} 
      />
    </div>
  );
};

export default UserDashboard;