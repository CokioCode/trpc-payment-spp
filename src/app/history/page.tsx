"use client";

import ProtectedRoute from "../../components/commons/protected-route";
import Navigation from "../../components/commons/navigation";
import { useAuth } from "../../context/auth-context";
import { trpc } from "../../lib/trpc";
import { useState } from "react";

export default function HistoryPage() {
  return (
    <ProtectedRoute requiredPermission="lihat_history_pembayaran">
      <Navigation />
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    siswaId: "",
    bulan: "",
    tahun: "",
  });

  const { data: historyData, isLoading } = trpc.pembayaran.getHistory.useQuery({
    page,
    limit: 10,
    ...filters,
  });

  const { data: siswaList } = trpc.siswa.getAll.useQuery(
    { page: 1, limit: 100 },
    { enabled: user?.role === "ADMINISTRATOR" }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1>History Pembayaran</h1>

      {user?.role === "SISWA" && user.siswa && (
        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <h3>Data Siswa</h3>
          <p>
            <strong>NIS:</strong> {user.siswa.nis}
          </p>
          <p>
            <strong>Nama:</strong> {user.siswa.nama}
          </p>
          <p>
            <strong>Kelas:</strong>{" "}
            {user.siswa.kelas?.nama_kelas || "Belum ada kelas"}
          </p>
        </div>
      )}

      {(user?.role === "ADMINISTRATOR" || user?.role === "PETUGAS") && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <label>Siswa:</label>
            <select
              value={filters.siswaId}
              onChange={(e) =>
                setFilters({ ...filters, siswaId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Semua Siswa</option>
              {siswaList?.siswa.map((siswa) => (
                <option key={siswa.id} value={siswa.id}>
                  {siswa.nis} - {siswa.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Bulan:</label>
            <select
              value={filters.bulan}
              onChange={(e) =>
                setFilters({ ...filters, bulan: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Semua Bulan</option>
              {[
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ].map((bulan) => (
                <option key={bulan} value={bulan}>
                  {bulan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tahun:</label>
            <select
              value={filters.tahun}
              onChange={(e) =>
                setFilters({ ...filters, tahun: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Semua Tahun</option>
              {["2024", "2023", "2022", "2021"].map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ccc",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Tanggal
            </th>
            {user?.role !== "SISWA" && (
              <>
                <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                  NIS
                </th>
                <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                  Nama Siswa
                </th>
                <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                  Kelas
                </th>
              </>
            )}
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Bulan
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Tahun
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Jumlah
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Petugas
            </th>
          </tr>
        </thead>
        <tbody>
          {historyData?.pembayaran.map((pembayaran) => (
            <tr key={pembayaran.id}>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {new Date(pembayaran.tgl_bayar).toLocaleDateString("id-ID")}
              </td>
              {user?.role !== "SISWA" && (
                <>
                  <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                    {pembayaran.siswa.nis}
                  </td>
                  <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                    {pembayaran.siswa.nama}
                  </td>
                  <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                    {pembayaran.siswa.kelas?.nama_kelas || "-"}
                  </td>
                </>
              )}
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.bulan_bayar}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.tahun_bayar}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(pembayaran.jumlah_bayar)}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.petugas.nama_petugas}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {historyData && historyData.pagination.totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          {Array.from(
            { length: historyData.pagination.totalPages },
            (_, i) => i + 1
          ).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              style={{
                padding: "0.5rem",
                backgroundColor: page === pageNum ? "#007bff" : "#f8f9fa",
                color: page === pageNum ? "white" : "black",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {/* Summary for students */}
      {user?.role === "SISWA" && historyData && (
        <div
          style={{
            backgroundColor: "#d4edda",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "2rem",
          }}
        >
          <h3>Ringkasan Pembayaran</h3>
          <p>
            <strong>Total Pembayaran:</strong> {historyData.pembayaran.length}{" "}
            transaksi
          </p>
          <p>
            <strong>Total Nominal:</strong>{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(
              historyData.pembayaran.reduce((sum, p) => sum + p.jumlah_bayar, 0)
            )}
          </p>
        </div>
      )}
    </div>
  );
}
