import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RestaurantSession {
  restaurant: {
    name?: string;
    email?: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  userRole: string | null;
  expiresAt: number | null;
  isLoggedIn: boolean;

  setSession: (payload: {
    restaurant: { name?: string; email?: string };
    accessToken: string;
    refreshToken?: string | null;
    userRole?: string | null;
    expiresIn?: number | null;
  }) => void;
  logout: () => void;
}

export const useRestaurantSessionStore = create<RestaurantSession>()(
  persist(
    (set) => ({
      restaurant: null,
      accessToken: null,
      refreshToken: null,
      userRole: null,
      expiresAt: null,
      isLoggedIn: false,
      setSession: ({ restaurant, accessToken, refreshToken, userRole, expiresIn }) => {
        const expiresAt =
          typeof expiresIn === "number" && expiresIn > 0
            ? Date.now() + expiresIn * 1000
            : null;
        set({
          restaurant,
          accessToken,
          refreshToken: refreshToken ?? null,
          userRole: userRole ?? null,
          expiresAt,
          isLoggedIn: true,
        });
      },
      logout: () =>
        set({
          restaurant: null,
          accessToken: null,
          refreshToken: null,
          userRole: null,
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
        refreshToken: state.refreshToken,
        userRole: state.userRole,
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
