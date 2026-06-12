import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artist } from '@/types';
import { useToastStore } from '@/components/ui/Toast';

const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

interface ArtistAuthState {
  artist: Artist | null;
  sessionExpiresAt: number | null;
  setArtist: (artist: Artist) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  checkSessionExpiry: () => void;
  refreshSession: () => void;
}

export const useArtistStore = create<ArtistAuthState>()(
  persist(
    (set, get) => ({
      artist: null,
      sessionExpiresAt: null,

      setArtist: (artist) => {
        set({
          artist,
          sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
        });
        // Set cookie for middleware
        if (typeof document !== 'undefined') {
          document.cookie = `artist-session=true; max-age=${4 * 60 * 60}; path=/; SameSite=Lax`;
        }
      },

      logout: () => {
        set({ artist: null, sessionExpiresAt: null });
        // Remove cookie for middleware
        if (typeof document !== 'undefined') {
          document.cookie = 'artist-session=; max-age=0; path=/;';
        }
        useToastStore.getState().addToast('Logout berhasil.', 'success');
      },

      isAuthenticated: () => {
        const { artist, sessionExpiresAt } = get();
        if (!artist || !sessionExpiresAt) return false;
        if (Date.now() > sessionExpiresAt) {
          set({ artist: null, sessionExpiresAt: null });
          if (typeof document !== 'undefined') {
            document.cookie = 'artist-session=; max-age=0; path=/;';
          }
          return false;
        }
        return true;
      },

      checkSessionExpiry: () => {
        const { sessionExpiresAt } = get();
        if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
          set({ artist: null, sessionExpiresAt: null });
          if (typeof document !== 'undefined') {
            document.cookie = 'artist-session=; max-age=0; path=/;';
          }
        }
      },

      refreshSession: () =>
        set({ sessionExpiresAt: Date.now() + SESSION_DURATION_MS }),
    }),
    {
      name: 'artist-storage',
    }
  )
);
