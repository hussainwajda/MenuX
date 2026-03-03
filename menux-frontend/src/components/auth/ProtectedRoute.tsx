"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ForbiddenView } from "@/components/auth/ForbiddenView";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  permission?: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loginMode = useAuthStore((s) => s.loginMode);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(loginMode === "captain" ? "/captain/login" : "/login");
    }
  }, [isAuthenticated, loginMode, router]);

  if (!isAuthenticated) return null;

  if (permission && !hasPermission(permission)) {
    return <ForbiddenView />;
  }

  return <>{children}</>;
}
