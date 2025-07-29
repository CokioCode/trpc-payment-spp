"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";

export default function HistoryPembayaran() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: pembayaranData,
    isLoading,
    refetch,
  } = trpc.pembayaran.getHistory.useQuery({
    page,
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Riwayat Pembayaran</h1>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Cari siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

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
              Nama Siswa
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Kelas
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Bulan / Tahun
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Jumlah Bayar
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Tanggal Bayar
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Petugas
            </th>
          </tr>
        </thead>
        <tbody>
          {pembayaranData?.pembayaran.map((pembayaran: any) => (
            <tr key={pembayaran.id}>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.siswa?.nama}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.siswa?.kelas?.nama_kelas || "-"}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.bulan_bayar} / {pembayaran.tahun_bayar}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                Rp {pembayaran.jumlah_bayar.toLocaleString()}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {new Date(pembayaran.tgl_bayar).toLocaleDateString()}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {pembayaran.petugas?.nama_petugas}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pembayaranData && pembayaranData.pagination.totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          {Array.from(
            { length: pembayaranData.pagination.totalPages },
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
    </div>
  );
}
