import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artist } from '@/types';

interface ArtistAuthState {
  artist: Artist | null;
  setArtist: (artist: Artist | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useArtistStore = create<ArtistAuthState>()(
  persist(
    (set, get) => ({
      artist: null,
      setArtist: (artist) => set({ artist }),
      logout: () => {
        set({ artist: null });
        if (typeof window !== 'undefined') {
          window.location.href = '/artist/login';
        }
      },
      isAuthenticated: () => !!get().artist,
    }),
    {
      name: 'artist-storage',
    }
  )
);
