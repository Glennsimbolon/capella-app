import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { showToast } from '../common/Toast';

const Login = () => {
  const navigate = useNavigate();
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
      const result = await login(formData.email, formData.password, 'user');
      
      if (result.success) {
        showToast(`Selamat datang, ${result.user.nama}!`, 'success');
        navigate('/dashboard');
      } else {
        showToast(result.error, 'error');
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Terjadi kesalahan saat login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="login-card animate-scale-in">
        <div className="login-header">
          <div className="login-logo animate-float">CM</div>
          <h1 className="login-title">Capella Multidana</h1>
          <p className="login-subtitle">Portal Pengajuan Kredit Digital</p>
        </div>

        <div className="login-body">
          <div className="flex justify-center mb-6">
            <span className="badge-status">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse-dot"></span>
              Login Nasabah
            </span>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@gmail.com"
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
                'Masuk'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                Daftar di sini
              </Link>
            </p>
          </div>

          {/* 🔥 LINK ADMIN - TAMBAHKAN INI! */}
          <div className="text-center mt-2">
            <Link 
              to="/admin/login" 
              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
            
            </Link>
          </div>
        </div>

        <div className="login-footer">
          <div className="text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Akun Demo:</p>
            <p><span className="font-medium text-blue-700">user@gmail.com</span> / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;