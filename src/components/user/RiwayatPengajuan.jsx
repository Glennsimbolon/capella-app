import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StatusBadge from '../common/StatusBadge';
import { getPengajuanByUserId, subscribePengajuanByUser } from '../../services/supabase';
import { supabase } from '../../services/supabase';
import { formatRupiah, formatDateShort } from '../../utils/helpers';
import { showToast } from '../common/Toast';

const RiwayatPengajuan = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);

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

    const channel = subscribePengajuanByUser(user.id, (payload) => {
      console.log('Realtime update received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setPengajuanList(prev => [payload.new, ...prev]);
        showToast('Pengajuan baru ditambahkan!', 'info');
      } else if (payload.eventType === 'UPDATE') {
        setPengajuanList(prev => 
          prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          )
        );
        if (payload.old.status !== payload.new.status) {
          if (payload.new.status === 'Disetujui') {
            setNotif({
              type: 'success',
              title: '🎉 Pengajuan Disetujui!',
              message: `Pengajuan ${payload.new.id} Anda telah disetujui.`,
              id: payload.new.id
            });
          } else if (payload.new.status === 'Ditolak') {
            setNotif({
              type: 'error',
              title: '❌ Pengajuan Ditolak',
              message: `Pengajuan ${payload.new.id} Anda ditolak.`,
              id: payload.new.id,
              catatanAdmin: payload.new.catatan_admin
            });
          }
        }
      } else if (payload.eventType === 'DELETE') {
        setPengajuanList(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadData]);

  // ===== FUNGSI NAVIGASI KEMBALI =====
  const handleBack = () => {
    try {
      navigate('/dashboard');
    } catch (error) {
      console.error('Navigasi gagal:', error);
      window.location.href = '/dashboard';
    }
  };

  // ===== POPUP NOTIFIKASI =====
  const NotifikasiPopup = ({ notif, onClose }) => {
    if (!notif) return null;
    const isSuccess = notif.type === 'success';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
          <div className={`p-6 text-center ${
            isSuccess ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="text-5xl mb-2">{isSuccess ? '🎉' : '❌'}</div>
            <h3 className="text-xl font-bold text-white">{notif.title}</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-700 text-center mb-4">{notif.message}</p>
            {notif.catatanAdmin && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <p className="text-xs text-gray-400 font-medium">Catatan Admin:</p>
                <p className="text-sm text-gray-700">{notif.catatanAdmin}</p>
              </div>
            )}
            <div className="text-center text-xs text-gray-400">ID: {notif.id}</div>
          </div>
          <div className="border-t border-gray-100 p-4 text-center">
            <button onClick={onClose} className="btn btn-primary w-full">
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
          
          {/* 🔥 TOMBOL KEMBALI DIPERBAIKI */}
          <button
            onClick={handleBack}
            className="btn btn-secondary flex items-center gap-2"
          >
            ← Kembali
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

      <NotifikasiPopup notif={notif} onClose={() => setNotif(null)} />
    </div>
  );
};

export default RiwayatPengajuan;