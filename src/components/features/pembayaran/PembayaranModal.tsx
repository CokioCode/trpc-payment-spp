import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { z } from "zod";

const schema = z.object({
  id_siswa: z.string().min(1, "Siswa harus dipilih"),
  bulan_bayar: z.string().min(1, "Bulan bayar harus diisi"),
  tahun_bayar: z.string().min(1, "Tahun bayar harus diisi"),
  jumlah_bayar: z.number().min(1, "Jumlah bayar harus lebih dari 0"),
});

export default function PembayaranModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    id_siswa: "",
    bulan_bayar: "",
    tahun_bayar: "",
    jumlah_bayar: "",
  });

  const { data: siswaData } = trpc.siswa.getAll.useQuery({
    page: 1,
    limit: 10,
  });

  const createMutation = trpc.pembayaran.create.useMutation({
    onSuccess: () => {
      alert("Pembayaran berhasil disimpan");
      onSuccess();
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      ...formData,
      jumlah_bayar: Number(formData.jumlah_bayar),
    });

    if (!parsed.success) {
      return;
    }

    createMutation.mutate({
      ...parsed.data,
    });
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
        <h2>Entri Pembayaran</h2>
        <form onSubmit={handleSubmit}>
          {/* Siswa */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Siswa:</label>
            <select
              value={formData.id_siswa}
              onChange={(e) =>
                setFormData({ ...formData, id_siswa: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Pilih Siswa</option>
              {siswaData?.siswa.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Bulan */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Bulan:</label>
            <input
              type="text"
              value={formData.bulan_bayar}
              onChange={(e) =>
                setFormData({ ...formData, bulan_bayar: e.target.value })
              }
              required
              placeholder="Contoh: Januari"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Tahun */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Tahun:</label>
            <input
              type="number"
              value={formData.tahun_bayar}
              onChange={(e) =>
                setFormData({ ...formData, tahun_bayar: e.target.value })
              }
              required
              placeholder="Contoh: 2025"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Jumlah */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Jumlah Bayar:</label>
            <input
              type="number"
              value={formData.jumlah_bayar}
              onChange={(e) =>
                setFormData({ ...formData, jumlah_bayar: e.target.value })
              }
              required
              min={1}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
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
              disabled={createMutation.isPending}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
