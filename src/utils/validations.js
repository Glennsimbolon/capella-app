export const validatePengajuan = (formData) => {
    const errors = {};
  
    if (!formData.ttl || formData.ttl.trim() === '') {
      errors.ttl = 'Tempat/Tanggal lahir wajib diisi';
    }
  
    if (!formData.alamat || formData.alamat.trim() === '') {
      errors.alamat = 'Alamat wajib diisi';
    }
  
    if (!formData.pekerjaan || formData.pekerjaan.trim() === '') {
      errors.pekerjaan = 'Pekerjaan wajib diisi';
    }
  
    const penghasilan = Number(formData.penghasilan);
    if (!penghasilan || penghasilan < 1000000) {
      errors.penghasilan = 'Penghasilan minimal Rp 1.000.000';
    }
  
    const nominal = Number(formData.nominal);
    if (!nominal || nominal <= 0) {
      errors.nominal = 'Nominal pengajuan wajib diisi';
    } else if (nominal > 200000000) {
      errors.nominal = 'Nominal maksimal Rp 200.000.000';
    }
  
    const tenor = Number(formData.tenor);
    if (!tenor || tenor <= 0) {
      errors.tenor = 'Tenor wajib diisi';
    } else if (tenor > 24) {
      errors.tenor = 'Tenor maksimal 24 bulan';
    }
  
    return errors;
  };
  
  export const validateLogin = (data) => {
    const errors = {};
  
    if (!data.username || data.username.trim() === '') {
      errors.username = 'Username wajib diisi';
    }
  
    if (!data.password || data.password.trim() === '') {
      errors.password = 'Password wajib diisi';
    }
  
    return errors;
  };