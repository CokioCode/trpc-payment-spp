"use client";

import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: "ADMINISTRATOR" | "PETUGAS" | "SISWA";
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Check role
  if (requiredRole && user.role !== requiredRole) {
    return (
      fallback || (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required role: {requiredRole}</p>
          <p>Your role: {user.role}</p>
        </div>
      )
    );
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required permission: {requiredPermission}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
