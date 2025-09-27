"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthUser {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static user list for application access
const AUTH_USERS: AuthUser[] = [
  { username: "admin", password: "iptv2024" },
  { username: "editor", password: "afu2024" },
  { username: "viewer", password: "guest123" }
];

const AUTH_STORAGE_KEY = "afu-iptv-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUsername = localStorage.getItem(AUTH_STORAGE_KEY);
        if (
          storedUsername &&
          AUTH_USERS.some((user) => user.username === storedUsername)
        ) {
          setIsAuthenticated(true);
          setCurrentUser(storedUsername);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const trimmedUsername = username.trim().toLowerCase();
    const matchedUser = AUTH_USERS.find(
      (user) =>
        user.username.toLowerCase() === trimmedUsername &&
        user.password === password
    );

    if (matchedUser) {
      setIsAuthenticated(true);
      setCurrentUser(matchedUser.username);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, matchedUser.username);
        } catch (error) {
          console.error("Auth save error:", error);
        }
      }

      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        console.error("Auth clear error:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, currentUser, login, logout, isLoading }}
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
