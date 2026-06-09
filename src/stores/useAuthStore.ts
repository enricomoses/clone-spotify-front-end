import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

interface AuthState {
  user: User | null;
  sessionExpiresAt: number | null;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  checkSessionExpiry: () => void;
  refreshSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessionExpiresAt: null,

      setUser: (user) =>
        set({
          user,
          sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
        }),

      logout: () => {
        set({ user: null, sessionExpiresAt: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },

      isAuthenticated: () => {
        const { user, sessionExpiresAt } = get();
        if (!user || !sessionExpiresAt) return false;
        if (Date.now() > sessionExpiresAt) {
          // Session expired — auto logout
          set({ user: null, sessionExpiresAt: null });
          return false;
        }
        return true;
      },

      checkSessionExpiry: () => {
        const { sessionExpiresAt } = get();
        if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
          set({ user: null, sessionExpiresAt: null });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      },

      refreshSession: () =>
        set({ sessionExpiresAt: Date.now() + SESSION_DURATION_MS }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
