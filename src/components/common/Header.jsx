import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuthContext();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl border border-white/30">
              CM
            </div>
            <div>
              <h1 className="text-xl font-bold">Capella Multidana</h1>
              <p className="text-xs text-blue-100">Sistem Pengajuan Kredit Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full border border-white/20">
              {user?.role === 'admin' ? (
                <span className="text-sm">🛡️</span>
              ) : (
                <span className="text-sm">👤</span>
              )}
              <span className="text-sm font-semibold">{user?.nama}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {user?.role === 'admin' ? 'Admin' : 'Nasabah'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-semibold border border-white/20"
            >
              <span>🚪</span>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;