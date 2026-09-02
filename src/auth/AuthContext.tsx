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
  isPreview: boolean;
  login: (user: CustomerUser, accessToken: string, refreshToken: string) => Promise<void>;
  /** Developer-only: logs into a fake local session with no network calls at all, so every screen can be reviewed with static mock data. See src/preview/mockData.ts. */
  previewLogin: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = "thappa_user";

const PREVIEW_USER: CustomerUser = {
  id: "preview-user",
  role: "CUSTOMER",
  name: "UI Preview",
  email: "preview@thappa.dev",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            await AsyncStorage.removeItem(USER_KEY);
          }
        }
      } catch {
        // Storage should never prevent a customer from reaching sign-in.
        // The next successful login will write a fresh session.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(newUser: CustomerUser, accessToken: string, refreshToken: string) {
    await saveTokens(accessToken, refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setIsPreview(false);
    setUser(newUser);
  }

  function previewLogin() {
    setIsPreview(true);
    setUser(PREVIEW_USER);
  }

  async function logout() {
    if (!isPreview) {
      await clearTokens();
      await AsyncStorage.removeItem(USER_KEY);
    }
    setIsPreview(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isPreview, login, previewLogin, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
