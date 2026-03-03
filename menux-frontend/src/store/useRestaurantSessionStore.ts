import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RestaurantSession {
  restaurant: {
    id?: string;
    name?: string;
    slug?: string;
    subscriptionPlan?: string;
    ownerEmail?: string;
    isActive?: boolean;
  } | null;
  accessToken: string | null;
  rbacToken: string | null;
  refreshToken: string | null;
  userRole: string | null;
  permissions: string[] | null;
  authType: "owner" | "captain" | null;
  expiresAt: number | null;
  isLoggedIn: boolean;

  setSession: (payload: {
    restaurant: {
      id?: string;
      name?: string;
      slug?: string;
      subscriptionPlan?: string;
      ownerEmail?: string;
      isActive?: boolean;
    };
    accessToken: string;
    rbacToken?: string | null;
    refreshToken?: string | null;
    userRole?: string | null;
    permissions?: string[] | null;
    authType?: "owner" | "captain";
    expiresIn?: number | null;
  }) => void;
  setRbacSession: (payload: {
    rbacToken: string;
    permissions?: string[] | null;
    userRole?: string | null;
    authType?: "owner" | "captain";
  }) => void;
  logout: () => void;
}

export const useRestaurantSessionStore = create<RestaurantSession>()(
  persist(
    (set) => ({
      restaurant: null,
      accessToken: null,
      rbacToken: null,
      refreshToken: null,
      userRole: null,
      permissions: null,
      authType: null,
      expiresAt: null,
      isLoggedIn: false,
      setSession: ({ restaurant, accessToken, rbacToken, refreshToken, userRole, permissions, authType, expiresIn }) => {
        const expiresAt =
          typeof expiresIn === "number" && expiresIn > 0
            ? Date.now() + expiresIn * 1000
            : null;
        set({
          restaurant,
          accessToken,
          rbacToken: rbacToken ?? null,
          refreshToken: refreshToken ?? null,
          userRole: userRole ?? null,
          permissions: permissions ?? null,
          authType: authType ?? "owner",
          expiresAt,
          isLoggedIn: true,
        });
      },
      setRbacSession: ({ rbacToken, permissions, userRole, authType }) =>
        set((state) => ({
          ...state,
          rbacToken,
          permissions: permissions ?? state.permissions,
          userRole: userRole ?? state.userRole,
          authType: authType ?? state.authType ?? "owner",
        })),
      logout: () =>
        set({
          restaurant: null,
          accessToken: null,
          rbacToken: null,
          refreshToken: null,
          userRole: null,
          permissions: null,
          authType: null,
          expiresAt: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "menux_restaurant_session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        restaurant: state.restaurant,
        accessToken: state.accessToken,
        rbacToken: state.rbacToken,
        refreshToken: state.refreshToken,
        userRole: state.userRole,
        permissions: state.permissions,
        authType: state.authType,
        expiresAt: state.expiresAt,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.expiresAt && state.expiresAt <= Date.now()) {
          state.logout();
        }
      },
    }
  )
);
