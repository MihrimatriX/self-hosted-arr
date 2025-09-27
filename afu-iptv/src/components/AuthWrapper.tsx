"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, logout, isLoading, currentUser } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="relative">
      <button
        onClick={logout}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 text-sm font-medium transition-colors backdrop-blur-sm border border-red-500/20"
        title="Çıkış yap"
      >
        <LogOut className="h-4 w-4" />
        Çıkış
        {currentUser && (
          <span className="text-[11px] font-medium text-red-200/80">
            {currentUser}
          </span>
        )}
      </button>

      {children}
    </div>
  );
}
