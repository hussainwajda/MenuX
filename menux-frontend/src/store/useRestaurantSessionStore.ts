import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RestaurantSession {
  restaurant: {
    name?: string;
    email?: string;
  } | null;
  isLoggedIn: boolean;

  setRestaurant: (restaurant: { name?: string; email?: string }) => void;
  logout: () => void;
}

export const useRestaurantSessionStore = create<RestaurantSession>()(
  persist(
    (set) => ({
      restaurant: null,
      isLoggedIn: false,
      setRestaurant: (restaurant) =>
        set({
          restaurant,
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          restaurant: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "menux_restaurant_session",
      partialize: (state) => ({
        restaurant: state.restaurant,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
