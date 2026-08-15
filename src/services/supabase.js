import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found! Check .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  USERS: 'users',
  PENGAJUAN: 'pengajuan'
};

// ============ REALTIME ============

export const subscribePengajuan = (onChange) => {
  const channel = supabase
    .channel('pengajuan_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.PENGAJUAN
      },
      (payload) => {
        console.log('📡 Realtime update:', payload);
        onChange(payload);
      }
    )
    .subscribe();

  return channel;
};

export const subscribePengajuanByUser = (userId, onChange) => {
  const channel = supabase
    .channel(`pengajuan_${userId}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.PENGAJUAN,
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log(`📡 Realtime update for user ${userId}:`, payload);
        onChange(payload);
      }
    )
    .subscribe();

  return channel;
};

// ============ USERS ============

export const getUsers = async () => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*');
  
  if (error) {
    console.error('❌ Error get users:', error);
    return [];
  }
  return data;
};

// ===== FIND BY EMAIL (LOGIN PAKAI INI) =====
export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error find user by email:', error);
    return null;
  }
  return data;
};

// ===== FIND BY ID =====
export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error find user by id:', error);
    return null;
  }
  return data;
};

// ===== FIND BY NIK (untuk cek duplikat) =====
export const findUserByNik = async (nik) => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('nik', nik)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error find user by nik:', error);
    return null;
  }
  return data;
};

// ===== LOGIN WITH EMAIL =====
export const loginUser = async (email, password, role) => {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'Email tidak ditemukan' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Password salah' };
    }
    
    if (user.role !== role) {
      return { success: false, error: `Akun ini bukan ${role === 'admin' ? 'admin' : 'nasabah'}` };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('capella_current_user', JSON.stringify(userWithoutPassword));
    
    return { success: true, user: userWithoutPassword };
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: 'Terjadi kesalahan saat login' };
  }
};

// ===== LOGOUT =====
export const logoutUser = () => {
  localStorage.removeItem('capella_current_user');
};

// ===== GET CURRENT USER =====
export const getCurrentUser = () => {
  const user = localStorage.getItem('capella_current_user');
  return user ? JSON.parse(user) : null;
};

// ===== REGISTER USER =====
export const registerUser = async (userData) => {
  try {
    // 1. Cek email sudah digunakan
    const existingEmail = await findUserByEmail(userData.email);
    if (existingEmail) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
    }
    
    // 2. Cek NIK sudah digunakan
    const existingNik = await findUserByNik(userData.nik);
    if (existingNik) {
      return { success: false, error: 'NIK sudah terdaftar. NIK tidak boleh digunakan 2x.' };
    }
    
    // 3. Generate ID unik
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    const id = `u${timestamp}${random}`;
    
    // 4. Insert ke Supabase
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([
        {
          id: id,
          email: userData.email,
          password: userData.password,
          nama: userData.nama,
          nik: userData.nik,
          ttl: userData.ttl || '',
          alamat: userData.alamat || '',
          pekerjaan: userData.pekerjaan || '',
          penghasilan: Number(userData.penghasilan) || 0,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Error register user:', error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      return { success: false, error: 'Gagal menyimpan data user' };
    }
    
    const { password: _, ...userWithoutPassword } = data[0];
    
    console.log('✅ Registrasi berhasil:', userWithoutPassword);
    return { success: true, user: userWithoutPassword };
    
  } catch (error) {
    console.error('❌ Error register user:', error);
    return { success: false, error: 'Terjadi kesalahan saat registrasi' };
  }
};

// ============ PENGAJUAN ============

export const getPengajuan = async () => {
  const { data, error } = await supabase
    .from(TABLES.PENGAJUAN)
    .select('*')
    .order('tanggal', { ascending: false });
  
  if (error) {
    console.error('❌ Error get pengajuan:', error);
    return [];
  }
  return data;
};

export const getPengajuanByUserId = async (userId) => {
  const { data, error } = await supabase
    .from(TABLES.PENGAJUAN)
    .select('*')
    .eq('user_id', userId)
    .order('tanggal', { ascending: false });
  
  if (error) {
    console.error('❌ Error get pengajuan by user:', error);
    return [];
  }
  return data;
};

export const getPengajuanById = async (id) => {
  const { data, error } = await supabase
    .from(TABLES.PENGAJUAN)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error get pengajuan by id:', error);
    return null;
  }
  return data;
};

export const getPengajuanCount = async () => {
  const { count, error } = await supabase
    .from(TABLES.PENGAJUAN)
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Error get pengajuan count:', error);
    return 0;
  }
  return count || 0;
};

export const getActivePengajuanCount = async (userId) => {
  const userPengajuan = await getPengajuanByUserId(userId);
  return userPengajuan.filter(p => 
    p.status === 'Menunggu' || p.status === 'Disetujui'
  ).length;
};

export const submitPengajuan = async (data) => {
  try {
    // Cek user
    const user = await findUserById(data.userId);
    if (!user) {
      return { success: false, error: 'User tidak ditemukan' };
    }
    
    // Cek batas aktif
    const activeCount = await getActivePengajuanCount(data.userId);
    if (activeCount >= 3) {
      return { success: false, error: 'Maksimal 3 pengajuan aktif' };
    }
    
    // Generate ID
    const year = new Date().getFullYear();
    const count = await getPengajuanCount();
    const id = `PGJ-${year}-${String(count + 1).padStart(3, '0')}`;
    
    const { data: result, error } = await supabase
      .from(TABLES.PENGAJUAN)
      .insert([
        {
          id: id,
          user_id: data.userId,
          nik: data.nik || '',
          nama: data.nama || '',
          ttl: data.ttl || '',
          alamat: data.alamat || '',
          pekerjaan: data.pekerjaan || '',
          penghasilan: Number(data.penghasilan) || 0,
          tipe: data.tipe || 'Motor',
          nominal: Number(data.nominal) || 0,
          tenor: Number(data.tenor) || 0,
          catatan: data.catatan || '',
          status: 'Menunggu',
          tanggal: new Date().toISOString(),
          catatan_admin: '',
          angsuran: Number(data.angsuran) || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Error submit pengajuan:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Pengajuan berhasil disimpan:', result);
    return { success: true, data: result[0] };
    
  } catch (error) {
    console.error('❌ Error submit pengajuan:', error);
    return { success: false, error: 'Terjadi kesalahan saat submit' };
  }
};

export const approvePengajuan = async (id, catatan) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PENGAJUAN)
      .update({
        status: 'Disetujui',
        catatan_admin: catatan || 'Disetujui oleh admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Error approve pengajuan:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data[0] };
    
  } catch (error) {
    console.error('❌ Error approve pengajuan:', error);
    return { success: false, error: 'Terjadi kesalahan saat approve' };
  }
};

export const rejectPengajuan = async (id, catatan) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PENGAJUAN)
      .update({
        status: 'Ditolak',
        catatan_admin: catatan || 'Ditolak oleh admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Error reject pengajuan:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data[0] };
    
  } catch (error) {
    console.error('❌ Error reject pengajuan:', error);
    return { success: false, error: 'Terjadi kesalahan saat reject' };
  }
};

export const getAdminStats = async () => {
  const allPengajuan = await getPengajuan();
  return {
    total: allPengajuan.length,
    menunggu: allPengajuan.filter(p => p.status === 'Menunggu').length,
    disetujui: allPengajuan.filter(p => p.status === 'Disetujui').length,
    ditolak: allPengajuan.filter(p => p.status === 'Ditolak').length
  };
};

export const getUserStats = async (userId) => {
  const userPengajuan = await getPengajuanByUserId(userId);
  return {
    total: userPengajuan.length,
    disetujui: userPengajuan.filter(p => p.status === 'Disetujui').length,
    ditolak: userPengajuan.filter(p => p.status === 'Ditolak').length,
    menunggu: userPengajuan.filter(p => p.status === 'Menunggu').length
  };
};