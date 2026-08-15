export const APP_NAME = 'Capella Multidana';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  USERS: 'capella_users',
  PENGAJUAN: 'capella_pengajuan',
  CURRENT_USER: 'capella_current_user'
};

export const STATUS = {
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak'
};

export const TIPE_PENGAJUAN = {
  MOTOR: 'Motor',
  MOBIL: 'Mobil',
  MULTIGUNA: 'Multiguna'
};

export const MAX_ACTIVE_PENGAJUAN = 3;
export const MAX_NOMINAL = 200000000;
export const MIN_PENGHASILAN = 1000000;
export const MAX_TENOR = 24;

export const STATUS_COLORS = {
  [STATUS.MENUNGGU]: 'yellow',
  [STATUS.DISETUJUI]: 'green',
  [STATUS.DITOLAK]: 'red'
};