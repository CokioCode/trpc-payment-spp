"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SppModal from "./SppModal";

export default function SppList() {
  const [selectedSpp, setSelectedSpp] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    data: sppList,
    isLoading,
    refetch,
  } = trpc.spp.getAll.useQuery({
    page: 1,
    limit: 10,
  });

  const deleteMutation = trpc.spp.delete.useMutation({
    onSuccess: () => {
      alert("SPP berhasil dihapus");
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const openEditModal = (spp: any) => {
    setSelectedSpp(spp);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedSpp(null);
    setShowModal(true);
  };

  if (isLoading) return <p>Memuat data...</p>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={openCreateModal}
          style={{
            background: "#28a745",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
          }}
        >
          + Tambah SPP
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={th}>Tahun</th>
            <th style={th}>Nominal</th>
            <th style={th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sppList?.spp.map((spp) => (
            <tr key={spp.id}>
              <td style={td}>{spp.tahun}</td>
              <td style={td}>Rp {spp.nominal.toLocaleString()}</td>
              <td style={td}>
                <button onClick={() => openEditModal(spp)} style={btnEdit}>
                  Edit
                </button>
                <button onClick={() => handleDelete(spp.id)} style={btnDelete}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <SppModal
          spp={selectedSpp}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            refetch();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

const th = {
  padding: "0.5rem",
  border: "1px solid #ddd",
  textAlign: "left" as const,
};
const td = {
  padding: "0.5rem",
  border: "1px solid #ddd",
};

const btnEdit = {
  background: "#007bff",
  color: "white",
  border: "none",
  padding: "0.3rem 0.6rem",
  marginRight: "0.5rem",
  borderRadius: "4px",
};

const btnDelete = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "0.3rem 0.6rem",
  borderRadius: "4px",
};
