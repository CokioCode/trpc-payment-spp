"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  nama: string;
  role: "ADMINISTRATOR" | "PETUGAS" | "SISWA";
  siswa?: {
    id: string;
    nis: string;
    nama: string;
    kelas?: {
      id: string;
      nama_kelas: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS = {
  ADMINISTRATOR: [
    "login",
    "logout",
    "crud_data_siswa",
    "crud_data_petugas",
    "crud_data_kelas",
    "crud_data_spp",
    "entri_transaksi_pembayaran",
    "lihat_history_pembayaran",
    "generate_laporan",
  ],
  PETUGAS: [
    "login",
    "logout",
    "entri_transaksi_pembayaran",
    "lihat_history_pembayaran",
  ],
  SISWA: ["login", "logout", "lihat_history_pembayaran"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get("token");
    const savedUser = Cookies.get("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    Cookies.set("token", newToken);
    Cookies.set("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
