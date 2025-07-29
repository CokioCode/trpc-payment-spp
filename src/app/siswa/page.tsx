"use client";

import ProtectedRoute from "../../components/commons/protected-route";
import Navigation from "../../components/commons/navigation";
import SiswaList from "../../components/features/siswa/SiswaComp";

export default function SiswaPage() {
  return (
    <ProtectedRoute requiredPermission="crud_data_siswa">
      <Navigation />
      <SiswaList />
    </ProtectedRoute>
  );
}
