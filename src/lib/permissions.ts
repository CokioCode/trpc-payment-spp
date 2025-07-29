export enum Permission {
  LOGIN = "login",
  LOGOUT = "logout",

  CRUD_DATA_SISWA = "crud_data_siswa",
  CRUD_DATA_PETUGAS = "crud_data_petugas",
  CRUD_DATA_KELAS = "crud_data_kelas",
  CRUD_DATA_SPP = "crud_data_spp",

  ENTRI_TRANSAKSI_PEMBAYARAN = "entri_transaksi_pembayaran",
  LIHAT_HISTORY_PEMBAYARAN = "lihat_history_pembayaran",

  GENERATE_LAPORAN = "generate_laporan",
}

export const ROLE_PERMISSIONS = {
  ADMINISTRATOR: [
    Permission.LOGIN,
    Permission.LOGOUT,
    Permission.CRUD_DATA_SISWA,
    Permission.CRUD_DATA_PETUGAS,
    Permission.CRUD_DATA_KELAS,
    Permission.CRUD_DATA_SPP,
    Permission.ENTRI_TRANSAKSI_PEMBAYARAN,
    Permission.LIHAT_HISTORY_PEMBAYARAN,
    Permission.GENERATE_LAPORAN,
  ],
  PETUGAS: [
    Permission.LOGIN,
    Permission.LOGOUT,
    Permission.CRUD_DATA_SISWA,
    Permission.ENTRI_TRANSAKSI_PEMBAYARAN,
    Permission.LIHAT_HISTORY_PEMBAYARAN,
  ],
  SISWA: [
    Permission.LOGIN,
    Permission.LOGOUT,
    Permission.LIHAT_HISTORY_PEMBAYARAN,
  ],
} as const;

export function hasPermission(
  userRole: keyof typeof ROLE_PERMISSIONS,
  permission: Permission
): boolean {
  return (ROLE_PERMISSIONS[userRole] as readonly Permission[]).includes(
    permission
  );
}

export function checkPermission(
  userRole: keyof typeof ROLE_PERMISSIONS,
  permission: Permission
): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}
