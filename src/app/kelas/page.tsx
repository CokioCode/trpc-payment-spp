"use client";

import ProtectedRoute from "../../components/commons/protected-route";
import Navigation from "../../components/commons/navigation";
import KelasList from "../../components/features/kelas/KelasComp";

export default function KelasPage() {
  return (
    <ProtectedRoute requiredPermission="crud_data_kelas">
      <Navigation />
      <KelasList />
    </ProtectedRoute>
  );
}
