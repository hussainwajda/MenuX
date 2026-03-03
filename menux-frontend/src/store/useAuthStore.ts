"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_CAPTAIN_PERMISSIONS, DEFAULT_OWNER_PERMISSIONS } from "@/config/rbac";
import { decodeJwt, isTokenExpired, userFromToken } from "@/lib/jwt";
import type { AuthState, AuthUser } from "@/types/auth";

type LoginMode = "owner" | "captain";

interface AuthStore extends AuthState {
  loginMode: LoginMode | null;
  login: (token: string, mode: LoginMode, userFallback?: AuthUser | null) => void;
  logout: () => void;
  hasPermission: (permissionKey: string) => boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  permissions: [],
  token: null,
  exp: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      loginMode: null,
      login: (token, mode, userFallback) => {
        const payload = decodeJwt(token);
        const role =
          (payload?.role as string | undefined) ||
          (mode === "owner" ? "OWNER" : "CAPTAIN");
        const permissions =
          Array.isArray(payload?.permissions) && payload?.permissions.length
            ? payload.permissions.filter((p): p is string => typeof p === "string")
            : mode === "owner"
              ? DEFAULT_OWNER_PERMISSIONS
              : DEFAULT_CAPTAIN_PERMISSIONS;

        const userFromJwt = payload ? userFromToken(payload) : null;
        const resolvedUser =
          userFallback
            ? {
                id: userFromJwt?.id || userFallback.id,
                restaurantId: userFromJwt?.restaurantId || userFallback.restaurantId,
                name: userFallback.name || userFromJwt?.name || "User",
                email: userFallback.email || userFromJwt?.email || "unknown@menux.app",
              }
            : userFromJwt;

        set({
          token,
          role,
          user: resolvedUser,
          permissions,
          exp: payload?.exp ?? null,
          isAuthenticated: true,
          loginMode: mode,
        });
      },
      logout: () => set({ ...initialState, loginMode: null }),
      hasPermission: (permissionKey: string) => {
        const state = get();
        if (!state.isAuthenticated) return false;
        return state.permissions.includes(permissionKey);
      },
    }),
    {
      name: "menux_auth_state",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state?.token) return;
        if (isTokenExpired(state.exp)) {
          state.logout();
        }
      },
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        permissions: state.permissions,
        token: state.token,
        exp: state.exp,
        isAuthenticated: state.isAuthenticated,
        loginMode: state.loginMode,
      }),
    }
  )
);
