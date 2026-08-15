const handleSubmit = async (e) => {
  e.preventDefault();
  
  setErrors({});
  const newErrors = {};
  
  const penghasilanValue = formData.penghasilan ? parseInt(unformatNumber(formData.penghasilan)) : 0;
  if (!penghasilanValue || penghasilanValue < 1000000) {
    newErrors.penghasilan = 'Nasabah belum dapat mengajukan pinjaman (Penghasilan minimal Rp 1.000.000)';
    showToast('Nasabah belum dapat mengajukan pinjaman', 'error');
    setErrors(newErrors);
    return;
  }
  
  const nominalValue = formData.nominal ? parseInt(unformatNumber(formData.nominal)) : 0;
  if (!nominalValue || nominalValue <= 0) {
    newErrors.nominal = 'Nominal pengajuan wajib diisi';
  } else if (nominalValue > 200000000) {
    newErrors.nominal = 'Nominal maksimal Rp 200.000.000';
    showToast('Nominal maksimal Rp 200.000.000', 'error');
    setErrors(newErrors);
    return;
  }
  
  const tenorValue = parseInt(formData.tenor);
  if (!tenorValue || tenorValue <= 0) {
    newErrors.tenor = 'Tenor wajib diisi';
  } else if (tenorValue > 24) {
    newErrors.tenor = 'Tenor maksimal 24 bulan';
    showToast('Tenor maksimal 24 bulan', 'error');
    setErrors(newErrors);
    return;
  }

  // 🔥 VALIDASI RASIO ANGSURAN (MAKSIMAL 40% DARI PENGHASILAN)
  const bungaPerBulan = 0.015;
  const angsuranPokok = nominalValue / tenorValue;
  const angsuranBunga = nominalValue * bungaPerBulan;
  const angsuranPerBulan = Math.round(angsuranPokok + angsuranBunga);
  const rasioAngsuran = (angsuranPerBulan / penghasilanValue) * 100;

  if (rasioAngsuran > 40) {
    const maxAngsuran = Math.round(penghasilanValue * 0.4);
    const maxPinjaman = Math.round((maxAngsuran / (bungaPerBulan + 1/tenorValue)));
    newErrors.nominal = `Angsuran (${formatRupiah(angsuranPerBulan)}) melebihi 40% dari penghasilan (${formatRupiah(penghasilanValue)}). Maksimal angsuran ${formatRupiah(maxAngsuran)}.`;
    showToast(`Angsuran melebihi 40% dari penghasilan! Maksimal ${formatRupiah(maxAngsuran)}`, 'error');
    setErrors(newErrors);
    return;
  }
  
  // ... lanjut validasi field lainnya
};