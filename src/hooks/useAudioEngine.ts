import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '@/stores/usePlayerStore';

/**
 * Audio engine hook that bridges the Zustand player store with Howler.js.
 * This hook reacts to store state changes and controls actual audio playback.
 *
 * Supports both songs and audio-only episodes.
 * Video episodes are handled by the <video> element in PlayerBar, NOT by this hook.
 *
 * Mount this hook ONCE in the PlayerBar or a top-level layout component.
 */
export function useAudioEngine() {
  const howlRef = useRef<Howl | null>(null);
  const animFrameRef = useRef<number>(0);
  const currentTrackIdRef = useRef<string | null>(null);
  const isSeeking = useRef(false);

  // Subscribe to individual store slices to avoid unnecessary re-renders
  const currentSong = usePlayerStore((s) => s.currentSong);
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const nextSong = usePlayerStore((s) => s.nextSong);
  const seekTo = usePlayerStore((s) => s.seekTo);

  // Determine whether this engine should be active
  // Video episodes are driven by the <video> element, not Howler
  const isVideoEpisode = currentEpisode && currentEpisode.video_url;

  // Derive the track ID and audio URL
  const trackId = currentSong?.id_song ?? (currentEpisode && !isVideoEpisode ? currentEpisode.id_episode : null);
  const audioUrl = currentSong?.audio_url ?? (currentEpisode && !isVideoEpisode ? currentEpisode.audio_url : null);

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

  // ─── Load new track when currentSong or currentEpisode changes ────
  useEffect(() => {
    // Same track — don't reload
    if (trackId === currentTrackIdRef.current) return;
    currentTrackIdRef.current = trackId;

    // Cleanup previous howl
    if (howlRef.current) {
      stopProgressLoop();
      howlRef.current.unload();
      howlRef.current = null;
    }

    if (!audioUrl || !trackId) {
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
        // Handle repeat / next
        if (repeatModeRef.current === 'one') {
          howl.seek(0);
          howl.play();
        } else {
          // For episodes (no queue), just stop. For songs, go to next.
          if (usePlayerStore.getState().currentSong) {
            nextSongRef.current();
          } else {
            usePlayerStore.setState({ isPlaying: false, currentTime: 0 });
          }
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
      // Cleanup on unmount or before next track loads
    };
  }, [trackId, audioUrl, setDuration, setCurrentTime, startProgressLoop, stopProgressLoop]);

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

    // Only process seek for Howler-managed tracks (not video episodes)
    if (isVideoEpisode) return;

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
  }, [seekTo, setCurrentTime, isVideoEpisode]);

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
