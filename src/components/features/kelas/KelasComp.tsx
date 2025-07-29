"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";

export default function KelasList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<any>(null);

  const {
    data: kelasData,
    isLoading,
    refetch,
  } = trpc.kelas.getAllWithDetails.useQuery({
    page,
    limit: 10,
    search: search || undefined,
  });

  const deleteMutation = trpc.kelas.delete.useMutation({
    onSuccess: () => {
      refetch();
      alert("Kelas berhasil dihapus");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus kelas ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (kelas: any) => {
    setEditingKelas(kelas);
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Data Kelas</h1>
        <button
          onClick={() => {
            setEditingKelas(null);
            setIsModalOpen(true);
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Tambah Kelas
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Cari kelas..."
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
              Nama Kelas
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Jumlah Siswa
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {kelasData?.kelas.map((kelas) => (
            <tr key={kelas.id}>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {kelas.nama_kelas}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {kelas._count.siswa}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                <button
                  onClick={() => handleEdit(kelas)}
                  style={{
                    marginRight: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#ffc107",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(kelas.id)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
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

      {kelasData && kelasData.pagination.totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          {Array.from(
            { length: kelasData.pagination.totalPages },
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

      {isModalOpen && (
        <KelasModal
          kelas={editingKelas}
          onClose={() => {
            setIsModalOpen(false);
            setEditingKelas(null);
          }}
          onSuccess={() => {
            refetch();
            setIsModalOpen(false);
            setEditingKelas(null);
          }}
        />
      )}
    </div>
  );
}

function KelasModal({ kelas, onClose, onSuccess }: any) {
  const [namaKelas, setNamaKelas] = useState(kelas?.nama_kelas || "");

  const createMutation = trpc.kelas.create.useMutation({
    onSuccess: () => {
      alert("Kelas berhasil ditambahkan");
      onSuccess();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateMutation = trpc.kelas.update.useMutation({
    onSuccess: () => {
      alert("Kelas berhasil diupdate");
      onSuccess();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (kelas) {
      updateMutation.mutate({ id: kelas.id, nama_kelas: namaKelas });
    } else {
      createMutation.mutate({ nama_kelas: namaKelas });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90vw",
        }}
      >
        <h2>{kelas ? "Edit Kelas" : "Tambah Kelas"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Nama Kelas:</label>
            <input
              type="text"
              value={namaKelas}
              onChange={(e) => setNamaKelas(e.target.value)}
              required
              placeholder="Contoh: X-IPA-1"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Menyimpan..."
                : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
