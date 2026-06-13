import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '@/stores/usePlayerStore';

/**
 * Audio engine hook that bridges the Zustand player store with Howler.js.
 * This hook reacts to store state changes and controls actual audio playback.
 *
 * Mount this hook ONCE in the PlayerBar or a top-level layout component.
 */
export function useAudioEngine() {
  const howlRef = useRef<Howl | null>(null);
  const animFrameRef = useRef<number>(0);
  const currentSongIdRef = useRef<string | null>(null);
  const isSeeking = useRef(false);

  // Subscribe to individual store slices to avoid unnecessary re-renders
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const nextSong = usePlayerStore((s) => s.nextSong);
  const seekTo = usePlayerStore((s) => s.seekTo);

  // Keep refs updated for use inside Howl callbacks (avoid stale closures)
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;

  const nextSongRef = useRef(nextSong);
  nextSongRef.current = nextSong;

  // Progress tracking via requestAnimationFrame
  const startProgressLoop = useCallback(() => {
    const tick = () => {
      const howl = howlRef.current;
      if (howl && howl.playing() && !isSeeking.current) {
        const seek = howl.seek();
        if (typeof seek === 'number') {
          setCurrentTime(seek);
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [setCurrentTime]);

  const stopProgressLoop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ─── Load new song when currentSong changes ───────────────────────
  useEffect(() => {
    const songId = currentSong?.id_song ?? null;
    const audioUrl = currentSong?.audio_url;

    // Same song — don't reload
    if (songId === currentSongIdRef.current) return;
    currentSongIdRef.current = songId;

    // Cleanup previous howl
    if (howlRef.current) {
      stopProgressLoop();
      howlRef.current.unload();
      howlRef.current = null;
    }

    if (!audioUrl || !songId) {
      setDuration(0);
      setCurrentTime(0);
      return;
    }

    const howl = new Howl({
      src: [audioUrl],
      html5: true, // streaming — no need to download entire file first
      volume: usePlayerStore.getState().volume,
      onload: () => {
        const dur = howl.duration();
        setDuration(dur);
      },
      onplay: () => {
        startProgressLoop();
      },
      onpause: () => {
        stopProgressLoop();
      },
      onstop: () => {
        stopProgressLoop();
      },
      onend: () => {
        stopProgressLoop();
        // Handle repeat / next song
        if (repeatModeRef.current === 'one') {
          howl.seek(0);
          howl.play();
        } else {
          nextSongRef.current();
        }
      },
      onloaderror: (_id: number, err: unknown) => {
        console.error('Howler load error:', err);
      },
      onplayerror: (_id: number, err: unknown) => {
        console.error('Howler play error:', err);
        // Attempt to unlock audio context and retry
        howl.once('unlock', () => {
          howl.play();
        });
      },
    });

    howlRef.current = howl;

    // Auto-play if store says isPlaying
    if (usePlayerStore.getState().isPlaying) {
      howl.play();
    }

    return () => {
      // Cleanup on unmount or before next song loads
    };
  }, [currentSong?.id_song, currentSong?.audio_url, setDuration, setCurrentTime, startProgressLoop, stopProgressLoop]);

  // ─── Play / Pause ─────────────────────────────────────────────────
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;

    if (isPlaying) {
      if (!howl.playing()) {
        howl.play();
      }
    } else {
      if (howl.playing()) {
        howl.pause();
      }
    }
  }, [isPlaying]);

  // ─── Volume ───────────────────────────────────────────────────────
  useEffect(() => {
    const howl = howlRef.current;
    if (howl) {
      howl.volume(volume);
    }
  }, [volume]);

  // ─── Seek (via store's seekTo timestamp) ──────────────────────────
  useEffect(() => {
    if (seekTo === null || seekTo === undefined) return;
    const howl = howlRef.current;
    if (howl) {
      isSeeking.current = true;
      howl.seek(seekTo);
      setCurrentTime(seekTo);
      // Small delay to let Howler process the seek
      setTimeout(() => {
        isSeeking.current = false;
      }, 50);
    }
    // Reset the seekTo value after processing
    usePlayerStore.setState({ seekTo: null });
  }, [seekTo, setCurrentTime]);

  // ─── Cleanup on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopProgressLoop();
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
    };
  }, [stopProgressLoop]);
}
