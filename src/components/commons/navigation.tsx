"use client";

import Link from "next/link";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#343a40",
        padding: "1rem",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link
            href="/dashboard"
            style={{ color: "white", textDecoration: "none" }}
          >
            Dashboard
          </Link>

          {hasPermission("crud_data_siswa") && (
            <Link
              href="/siswa"
              style={{ color: "white", textDecoration: "none" }}
            >
              Data Siswa
            </Link>
          )}

          {hasPermission("crud_data_kelas") && (
            <Link
              href="/kelas"
              style={{ color: "white", textDecoration: "none" }}
            >
              Data Kelas
            </Link>
          )}

          {hasPermission("crud_data_petugas") && (
            <Link
              href="/petugas"
              style={{ color: "white", textDecoration: "none" }}
            >
              Data Petugas
            </Link>
          )}

          {hasPermission("crud_data_spp") && (
            <Link
              href="/spp"
              style={{ color: "white", textDecoration: "none" }}
            >
              Data SPP
            </Link>
          )}

          {hasPermission("entri_transaksi_pembayaran") && (
            <Link
              href="/pembayaran"
              style={{ color: "white", textDecoration: "none" }}
            >
              Pembayaran
            </Link>
          )}

          {hasPermission("lihat_history_pembayaran") && (
            <Link
              href="/history"
              style={{ color: "white", textDecoration: "none" }}
            >
              History
            </Link>
          )}

          {hasPermission("generate_laporan") && (
            <Link
              href="/laporan"
              style={{ color: "white", textDecoration: "none" }}
            >
              Laporan
            </Link>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "white" }}>
            {user.nama} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
