"use client";

import { useAuth } from "../context/auth-context";

export function usePermission() {
  const { hasPermission } = useAuth();

  const requirePermission = (permission: string, fallback?: () => void) => {
    if (!hasPermission(permission)) {
      if (fallback) {
        fallback();
        return false;
      }
      throw new Error(`Access denied. Required permission: ${permission}`);
    }
    return true;
  };

  return {
    hasPermission,
    requirePermission,
  };
}
