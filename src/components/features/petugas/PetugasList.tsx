"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import PetugasModal from "./PetugasModal"; // pastikan kamu punya komponen modalnya

export default function PetugasList() {
  const [modalData, setModalData] = useState<any>(null); // untuk edit
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.petugas.getAll.useQuery({
    page: 1,
    limit: 10,
    search: "",
  });

  const deleteMutation = trpc.petugas.delete.useMutation({
    onSuccess: () => {
      utils.petugas.getAll.invalidate(); // refresh list
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus petugas ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2>Daftar Petugas</h2>
        <button
          onClick={() => setModalData({})}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          + Tambah Petugas
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={th}>No</th>
            <th style={th}>Nama Petugas</th>
            <th style={th}>Username</th>
            <th style={th}>Jumlah Pembayaran</th>
            <th style={th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data?.petugas.map((petugas, i) => (
            <tr key={petugas.id}>
              <td style={td}>{i + 1}</td>
              <td style={td}>{petugas.nama_petugas}</td>
              <td style={td}>{petugas.username}</td>
              <td style={td}>{petugas._count.pembayarans}</td>
              <td style={td}>
                <button
                  onClick={() => setModalData(petugas)}
                  style={{
                    marginRight: "0.5rem",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "0.3rem 0.7rem",
                    borderRadius: "4px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(petugas.id)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "0.3rem 0.7rem",
                    borderRadius: "4px",
                  }}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalData !== null && (
        <PetugasModal
          petugas={modalData?.id ? modalData : null}
          onClose={() => setModalData(null)}
          onSuccess={() => {
            setModalData(null);
            utils.petugas.getAll.invalidate();
          }}
        />
      )}
    </div>
  );
}

const th = {
  padding: "0.75rem",
  textAlign: "left" as const,
  borderBottom: "1px solid #ccc",
};

const td = {
  padding: "0.75rem",
  borderBottom: "1px solid #eee",
};
