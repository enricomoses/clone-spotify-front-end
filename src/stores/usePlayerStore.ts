import { create } from 'zustand';
import type { Song, RepeatMode } from '@/types';

interface PlayerState {
  // State
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isQueueOpen: boolean;
  seekTo: number | null;

  // Actions
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  triggerSeek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleQueue: () => void;
  clearQueue: () => void;
  addToQueue: (song: Song) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial state
  currentSong: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isShuffle: false,
  repeatMode: 'off',
  isQueueOpen: false,
  seekTo: null,

  // Play a specific song, optionally setting the full queue
  playSong: (song, queue) => {
    const newQueue = queue || [song];
    const index = newQueue.findIndex((s) => s.id_song === song.id_song);
    set({
      currentSong: song,
      queue: newQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
      currentTime: 0,
    });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  nextSong: () => {
    const { queue, queueIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex: number;

    if (repeatMode === 'one') {
      // Repeat current song — trigger actual seek
      set({ currentTime: 0, seekTo: 0, isPlaying: true });
      return;
    }

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // End of queue, stop playing
          set({ isPlaying: false });
          return;
        }
      }
    }

    set({
      currentSong: queue[nextIndex],
      queueIndex: nextIndex,
      currentTime: 0,
      isPlaying: true,
    });
  },

  prevSong: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current song
    if (currentTime > 3) {
      set({ currentTime: 0, seekTo: 0 });
      return;
    }

    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    set({
      currentSong: queue[prevIndex],
      queueIndex: prevIndex,
      currentTime: 0,
      isPlaying: true,
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  triggerSeek: (time) => set({ seekTo: time, currentTime: time }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  cycleRepeat: () =>
    set((s) => ({
      repeatMode:
        s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
    })),
  toggleQueue: () => set((s) => ({ isQueueOpen: !s.isQueueOpen })),
  clearQueue: () => set({ queue: [], queueIndex: -1 }),
  addToQueue: (song) =>
    set((s) => ({
      queue: [...s.queue, song],
    })),
}));
