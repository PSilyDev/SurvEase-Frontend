// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";

type User = {
  _id?: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

type AuthValue = {
  user: User | null;
  token: string | null;
  login: (u: User, t: string) => void;
  logout: () => void;
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 👇 Initialize FROM localStorage on the very first render
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    try {
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      // ignore storage errors
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
