"use client";

import { useEffect } from "react";
import { setupAxiosInterceptors } from "@/lib/axios-client";
import { isTokenExpired } from "@/lib/jwt";
import { useAuthStore } from "@/store/useAuthStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const exp = useAuthStore((s) => s.exp);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isTokenExpired(exp)) {
        logout();
      }
    }, 15_000);

    return () => clearInterval(timer);
  }, [exp, logout]);

  return <>{children}</>;
}
