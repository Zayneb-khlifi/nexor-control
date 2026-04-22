// src/context/AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";  // 👈 IMPORT TYPE-ONLY


export interface User {
  id: number;
  nom: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
}

interface AuthContextType {
  user: User | null;
  loginUser: (data: { token: string; user: User }) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isUser: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loginUser: () => {},
  logout: () => {},
  hasRole: () => false,
  isAdmin: false,
  isSuperAdmin: false,
  isUser: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const loginUser = (data: { token: string; user: User }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isUser = user?.role === "USER";

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, hasRole, isAdmin, isSuperAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};