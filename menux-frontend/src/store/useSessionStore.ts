import { create } from 'zustand';

interface SessionStore {
  admin: any | null;
  isLoggedIn: boolean;

  // Actions
  setAdmin: (admin: any) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  admin: null,
  isLoggedIn: false,

  // Set admin session
  setAdmin: (admin) => set({
    admin: admin,
    isLoggedIn: true
  }),

  // Logout
  logout: () => set({
    admin: null,
    isLoggedIn: false
  })
}));