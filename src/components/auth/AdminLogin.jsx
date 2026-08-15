import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { showToast } from '../common/Toast';

const AdminLogin = () => {
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});
    
    if (!formData.email || formData.email.trim() === '') {
      setErrors({ email: 'Email wajib diisi' });
      showToast('Mohon lengkapi data login', 'error');
      return;
    }
    
    if (!formData.password || formData.password.trim() === '') {
      setErrors({ password: 'Password wajib diisi' });
      showToast('Mohon lengkapi data login', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Email tidak valid' });
      showToast('Email tidak valid', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password, 'admin');
      
      if (result.success) {
        showToast(`Selamat datang, ${result.user.nama}!`, 'success');
        // 🔥 PAKAI WINDOW.LOCATION!
        window.location.href = '/admin/dashboard';
      } else {
        showToast(result.error, 'error');
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      showToast('Terjadi kesalahan saat login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 relative overflow-hidden">
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/10 -top-20 -right-20"></div>
      <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 -bottom-20 -left-20"></div>
      
      <div className="login-card animate-scale-in">
        <div className="login-header">
          <div className="login-logo animate-float">CM</div>
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-subtitle">Capella Multidana</p>
        </div>

        <div className="login-body">
          <div className="flex justify-center mb-6">
            <span className="badge-status">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse-dot"></span>
              Akses Terbatas
            </span>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="input-label">Email Admin</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@capella.com"
                className={`input-field ${errors.email ? 'input-field-error' : ''}`}
              />
              {errors.email && <p className="input-error">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                className={`input-field ${errors.password ? 'input-field-error' : ''}`}
              />
              {errors.password && <p className="input-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block btn-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner"></span>
                  Memproses...
                </span>
              ) : (
                'Masuk sebagai Admin'
              )}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <div className="text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Akun Demo Admin:</p>
            <p><span className="font-medium text-blue-700">admin@capella.com</span> / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;