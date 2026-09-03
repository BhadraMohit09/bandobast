"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { token: string } & AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "bandobast_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          setUser({ userId: parsed.userId, email: parsed.email, displayName: parsed.displayName, profilePhotoUrl: parsed.profilePhotoUrl, role: parsed.role, isEmailVerified: parsed.isEmailVerified });
          setToken(parsed.token);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);
  }, []);

  function login(data: { token: string } & AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser({ userId: data.userId, email: data.email, displayName: data.displayName, profilePhotoUrl: data.profilePhotoUrl, role: data.role, isEmailVerified: data.isEmailVerified });
    setToken(data.token);
  }

  function updateUser(data: Partial<AuthUser>) {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...updatedUser, token }));
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
