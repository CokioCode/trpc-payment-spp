"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";

export default function SiswaList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<any>(null);

  const {
    data: siswaData,
    isLoading,
    refetch,
  } = trpc.siswa.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
  });

  const deleteMutation = trpc.siswa.delete.useMutation({
    onSuccess: () => {
      refetch();
      alert("Siswa berhasil dihapus");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus siswa ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (siswa: any) => {
    setEditingSiswa(siswa);
    setIsModalOpen(true);
  };

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
        <h1>Data Siswa</h1>
        <button
          onClick={() => {
            setEditingSiswa(null);
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
          Tambah Siswa
        </button>
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
              NIS
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Nama
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Kelas
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              No. Telp
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {siswaData?.siswa.map((siswa: any) => (
            <tr key={siswa.id}>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {siswa.nis}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {siswa.nama}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {siswa.kelas?.nama_kelas || "-"}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                {siswa.no_telp || "-"}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #ccc" }}>
                <button
                  onClick={() => handleEdit(siswa)}
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
                  onClick={() => handleDelete(siswa.id)}
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

      {siswaData && siswaData.pagination.totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          {Array.from(
            { length: siswaData.pagination.totalPages },
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
        <SiswaModal
          siswa={editingSiswa}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSiswa(null);
          }}
          onSuccess={() => {
            refetch();
            setIsModalOpen(false);
            setEditingSiswa(null);
          }}
        />
      )}
    </div>
  );
}

function SiswaModal({ siswa, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    nis: siswa?.nis || "",
    nama: siswa?.nama || "",
    alamat: siswa?.alamat || "",
    id_kelas: siswa?.id_kelas || "",
    no_telp: siswa?.no_telp || "",
  });

  const { data: kelasData } = trpc.kelas.getAll.useQuery();

  const createMutation = trpc.siswa.create.useMutation({
    onSuccess: () => {
      alert("Siswa berhasil ditambahkan");
      onSuccess();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateMutation = trpc.siswa.update.useMutation({
    onSuccess: () => {
      alert("Siswa berhasil diupdate");
      onSuccess();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (siswa) {
      updateMutation.mutate({ id: siswa.id, ...formData });
    } else {
      createMutation.mutate(formData);
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
          width: "500px",
          maxWidth: "90vw",
        }}
      >
        <h2>{siswa ? "Edit Siswa" : "Tambah Siswa"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>NIS:</label>
            <input
              type="text"
              value={formData.nis}
              onChange={(e) =>
                setFormData({ ...formData, nis: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Nama:</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Alamat:</label>
            <textarea
              value={formData.alamat}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minHeight: "80px",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Kelas:</label>
            <select
              value={formData.id_kelas}
              onChange={(e) =>
                setFormData({ ...formData, id_kelas: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Pilih Kelas</option>
              {kelasData?.map((kelas: any) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.nama_kelas}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>No. Telp:</label>
            <input
              type="text"
              value={formData.no_telp}
              onChange={(e) =>
                setFormData({ ...formData, no_telp: e.target.value })
              }
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
