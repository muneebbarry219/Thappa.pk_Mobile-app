import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveTokens, clearTokens } from "../api/client";

export interface CustomerUser {
  id: string;
  role: "CUSTOMER";
  name: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
}

interface AuthContextValue {
  user: CustomerUser | null;
  loading: boolean;
  login: (user: CustomerUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = "thappa_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(USER_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          await AsyncStorage.removeItem(USER_KEY);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(newUser: CustomerUser, accessToken: string, refreshToken: string) {
    await saveTokens(accessToken, refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  async function logout() {
    await clearTokens();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
