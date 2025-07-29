"use client";

import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { trpc } from "../../lib/trpc";
import { useEffect } from "react";
import Link from "next/link";
import Navigation from "../../components/commons/navigation";

export default function DashboardPage() {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  const { data: userData, isLoading: isUserLoading } = trpc.auth.me.useQuery(
    undefined,
    { enabled: !!user }
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      title: "Data Siswa",
      description: "Kelola data siswa, tambah, edit, dan hapus",
      href: "/siswa",
      color: "#007bff",
      permission: "crud_data_siswa",
    },
    {
      title: "Data Kelas",
      description: "Kelola data kelas dan struktur akademik",
      href: "/kelas",
      color: "#28a745",
      permission: "crud_data_kelas",
    },
    {
      title: "Data Petugas",
      description: "Kelola data petugas sekolah",
      href: "/petugas",
      color: "#17a2b8",
      permission: "crud_data_petugas",
    },
    {
      title: "Data SPP",
      description: "Kelola tarif SPP per tahun ajaran",
      href: "/spp",
      color: "#6f42c1",
      permission: "crud_data_spp",
    },
    {
      title: "Entry Pembayaran",
      description: "Input transaksi pembayaran SPP",
      href: "/pembayaran",
      color: "#fd7e14",
      permission: "entri_transaksi_pembayaran",
    },
    {
      title: "History Pembayaran",
      description: "Lihat riwayat pembayaran siswa",
      href: "/history",
      color: "#20c997",
      permission: "lihat_history_pembayaran",
    },
    {
      title: "Generate Laporan",
      description: "Buat laporan pembayaran dan statistik",
      href: "/laporan",
      color: "#e83e8c",
      permission: "generate_laporan",
    },
  ];

  const availableMenus = menuItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <div>
      <Navigation />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <h1>Selamat Datang, {userData?.nama || user.nama}!</h1>
          <p>
            Role: <strong>{user.role}</strong>
          </p>
          <p>Email: {userData?.email || user.email}</p>
          {user.siswa && (
            <p>
              NIS: <strong>{user.siswa.nis}</strong> - Kelas:{" "}
              <strong>
                {user.siswa.kelas?.nama_kelas || "Belum ada kelas"}
              </strong>
            </p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {availableMenus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: item.color,
                  color: "white",
                  padding: "2rem",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  minHeight: "150px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <h3 style={{ marginBottom: "1rem" }}>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {availableMenus.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Tidak ada menu yang tersedia untuk role Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
