import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        localStorage.setItem('agririsk_token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('agririsk_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'agririsk_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
