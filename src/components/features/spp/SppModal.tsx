import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { z } from "zod";

const schema = z.object({
  tahun: z.string().min(4, "Tahun harus diisi"),
  nominal: z.number().min(1, "Nominal harus lebih dari 0"),
});

export default function SppModal({ spp, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    tahun: "",
    nominal: "",
  });

  useEffect(() => {
    if (spp) {
      setFormData({
        tahun: spp.tahun || "",
        nominal: spp.nominal?.toString() || "",
      });
    }
  }, [spp]);

  const utils = trpc.useUtils();

  const createMutation = trpc.spp.create.useMutation({
    onSuccess: () => {
      alert("Data SPP berhasil ditambahkan");
      onSuccess?.();
    },
    onError: (err) => alert(err.message),
  });

  const updateMutation = trpc.spp.update.useMutation({
    onSuccess: () => {
      alert("Data SPP berhasil diperbarui");
      onSuccess?.();
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      tahun: formData.tahun,
      nominal: Number(formData.nominal),
    });

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      if (firstError) alert(firstError);
      return;
    }

    const data = parsed.data;
    if (spp?.id) {
      updateMutation.mutate({ id: spp.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>{spp ? "Edit SPP" : "Tambah SPP"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Tahun */}
          <div style={field}>
            <label>Tahun:</label>
            <input
              type="text"
              value={formData.tahun}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tahun: e.target.value }))
              }
              placeholder="Contoh: 2025"
              required
              style={input}
            />
          </div>

          {/* Nominal */}
          <div style={field}>
            <label>Nominal:</label>
            <input
              type="number"
              value={formData.nominal}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nominal: e.target.value }))
              }
              required
              min={1}
              style={input}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={buttonCancel}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              style={buttonSave}
            >
              {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90vw",
};

const field = { marginBottom: "1rem" };
const input = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const buttonCancel = {
  padding: "0.5rem 1rem",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

const buttonSave = {
  padding: "0.5rem 1rem",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
};
