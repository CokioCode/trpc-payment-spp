import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { z } from "zod";

const schema = z.object({
  nama_petugas: z.string().min(1, "Nama tidak boleh kosong"),
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(), // optional saat edit
});

export default function PetugasModal({ petugas, onClose, onSuccess }: any) {
  const isEdit = !!petugas;

  const [formData, setFormData] = useState({
    nama_petugas: petugas?.nama_petugas || "",
    username: petugas?.username || "",
    password: "", // kosongkan agar tidak diubah kecuali diisi
  });

  const createMutation = trpc.petugas.create.useMutation({
    onSuccess: () => {
      alert("Petugas berhasil ditambahkan");
      onSuccess?.();
    },
    onError: (err) => alert(err.message),
  });

  const updateMutation = trpc.petugas.update.useMutation({
    onSuccess: () => {
      alert("Petugas berhasil diperbarui");
      onSuccess?.();
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      alert(parsed.error.issues[0].message);
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id: petugas.id,
        ...parsed.data,
      });
    } else {
      const payload = {
        nama_petugas: formData.nama_petugas,
        username: formData.username,
        ...(formData.password ? { password: formData.password } : {}),
      };

      createMutation.mutate(
        payload as {
          username: string;
          password: string;
          nama_petugas: string;
        }
      );
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
        <h2>{isEdit ? "Edit Petugas" : "Tambah Petugas"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Nama */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Nama:</label>
            <input
              type="text"
              value={formData.nama_petugas}
              onChange={(e) =>
                setFormData({ ...formData, nama_petugas: e.target.value })
              }
              required
              style={inputStyle}
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              style={inputStyle}
            />
          </div>

          {/* Password */}
          {isEdit && (
            <div style={{ marginBottom: "1rem" }}>
              <label>Password:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                style={inputStyle}
              />
            </div>
          )}

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              style={saveButtonStyle}
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

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const cancelButtonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

const saveButtonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "4px",
};
