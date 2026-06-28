import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
  role: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'admin-auth-storage', // Key used in localStorage
    }
  )
);
