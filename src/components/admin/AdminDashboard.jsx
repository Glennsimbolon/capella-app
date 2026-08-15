import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StatsCard from '../common/StatsCard';
import StatusBadge from '../common/StatusBadge';
import { getPengajuan, getAdminStats, subscribePengajuan } from '../../services/supabase';
import { supabase } from '../../services/supabase';
import { formatRupiah, formatDateShort } from '../../utils/helpers';
import { showToast } from '../common/Toast';

const AdminDashboard = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    disetujui: 0,
    ditolak: 0
  });
  const [recentPengajuan, setRecentPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const adminStats = await getAdminStats();
      setStats(adminStats);
      
      const allPengajuan = await getPengajuan();
      setRecentPengajuan(
        allPengajuan
          .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadData();

    const channel = subscribePengajuan((payload) => {
      console.log('Admin Realtime update:', payload);
      
      if (payload.eventType === 'INSERT') {
        setRecentPengajuan(prev => [payload.new, ...prev.slice(0, 4)]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          menunggu: prev.menunggu + 1
        }));
        showToast(`Pengajuan baru dari ${payload.new.nama}`, 'info');
      } else if (payload.eventType === 'UPDATE') {
        setRecentPengajuan(prev => 
          prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          )
        );
        loadData();
        if (payload.old.status !== payload.new.status) {
          showToast(`Status pengajuan ${payload.new.id} berubah menjadi ${payload.new.status}`, 'info');
        }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800">
            Dashboard Admin
          </h2>
          <p className="text-gray-500">
            Selamat datang, {user?.nama} - {user?.jabatan || 'Administrator'}
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
            label="Menunggu Verifikasi"
            value={stats.menunggu}
            icon="⏳"
            color="yellow"
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
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/verifikasi')}
            className="btn btn-primary flex items-center gap-2"
          >
            Verifikasi Pengajuan
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Pengajuan Terbaru
          </h3>
          
          {recentPengajuan.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada pengajuan
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nasabah</th>
                    <th>Tipe</th>
                    <th>Nominal</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPengajuan.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium text-gray-800">{p.id}</td>
                      <td>{p.nama}</td>
                      <td>
                        <span className="badge badge-tipe">{p.tipe}</span>
                      </td>
                      <td className="font-medium">{formatRupiah(p.nominal)}</td>
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
    </div>
  );
};

export default AdminDashboard;