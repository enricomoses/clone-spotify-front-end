import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatDuration } from '@/utils/formatDuration';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState, useCallback, useEffect } from 'react';
import api from '@/lib/axios';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import LikeButton from '@/components/song/LikeButton';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlay,
    nextSong,
    prevSong,
    setCurrentTime,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleQueue,
    isQueueOpen,
    triggerSeek,
  } = usePlayerStore();

  const user = useAuthStore((s) => s.user);

  // Mount the audio engine — this drives actual Howler.js playback
  useAudioEngine();

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Streaming history tracking
  const [streamId, setStreamId] = useState<string | null>(null);
  const [trackStartTime, setTrackStartTime] = useState<number>(0);
  const prevSongRef = useRef<string | null>(null);

  // Flush stream duration to backend
  const flushStreamDuration = useCallback(async () => {
    if (!streamId || !user) return;
    const elapsed = Math.floor((Date.now() - trackStartTime) / 1000);
    if (elapsed >= 3) {
      try {
        await api.post(`/song-streaming/${streamId}`, {
          play_duration: elapsed,
          _method: 'PUT',
        });
      } catch (e) {
        console.error('Failed to update stream duration', e);
      }
    }
    setStreamId(null);
  }, [streamId, trackStartTime, user]);

  // Track song changes for streaming history
  useEffect(() => {
    const currentId = currentSong?.id_song || null;
    if (currentId !== prevSongRef.current && currentId && isPlaying && user) {
      // Flush previous stream
      if (streamId) {
        flushStreamDuration();
      }

      // Start new stream
      const startStream = async () => {
        try {
          const res = await api.post('/song-streaming', {
            id_user: user.id_user,
            id_song: currentId,
          });
          setStreamId(res.data.data.id_stream);
          setTrackStartTime(Date.now());
        } catch (e) {
          console.error('Failed to record stream start', e);
        }
      };
      startStream();
    }
    prevSongRef.current = currentId;
  }, [currentSong?.id_song, isPlaying]);

  // Flush on pause
  useEffect(() => {
    if (!isPlaying && streamId) {
      flushStreamDuration();
    }
  }, [isPlaying]);

  // Cleanup on window close
  useEffect(() => {
    const handleUnload = () => {
      if (streamId && user) {
        const elapsed = Math.floor((Date.now() - trackStartTime) / 1000);
        if (elapsed >= 3) {
          // Use sendBeacon for reliable delivery on unload
          const data = JSON.stringify({ play_duration: elapsed });
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          navigator.sendBeacon(
            `${baseUrl}/song-streaming/${streamId}`,
            new Blob([data], { type: 'application/json' })
          );
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [streamId, trackStartTime, user]);

  // Progress bar interaction
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      triggerSeek(ratio * duration);
    },
    [duration, triggerSeek]
  );

  // Volume bar interaction
  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!volumeRef.current) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(ratio);
    },
    [setVolume]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTime = isDragging ? dragTime : currentTime;

  // Volume icon
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // Repeat icon
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  if (!currentSong) {
    // Empty player bar
    return (
      <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 h-16 lg:h-[90px] bg-spotify-dark border-t border-spotify-border/30 z-30 flex items-center justify-center">
        <p className="text-sm text-spotify-muted/40">No song playing</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-spotify-dark border-t border-spotify-border/30 z-30 hidden lg:flex items-center px-4">
        {/* Left — Now Playing Info */}
        <div className="w-[30%] min-w-[180px] flex items-center gap-3">
          <div className="w-14 h-14 bg-spotify-card rounded-md overflow-hidden shrink-0 shadow-lg">
            {currentSong.album?.cover_image ? (
              <img
                src={currentSong.album.cover_image}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-spotify-muted" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
              {currentSong.title}
            </p>
            <p className="text-xs text-spotify-muted truncate">
              {currentSong.artists?.map((a) => a.name).join(', ') ||
                currentSong.album?.artists?.map((a) => a.name).join(', ') ||
                'Unknown Artist'}
            </p>
          </div>
          <LikeButton
            songId={currentSong.id_song}
            isLiked={user?.liked_songs?.some((s) => s.id_song === currentSong.id_song) || false}
            size="sm"
          />
        </div>

        {/* Center — Controls + Progress */}
        <div className="flex-1 max-w-[722px] flex flex-col items-center justify-center mx-4">
          {/* Control Buttons */}
          <div className="flex items-center gap-4 mb-1">
            <button
              onClick={toggleShuffle}
              className={cn(
                'p-1.5 transition-colors',
                isShuffle ? 'text-spotify-green hover:text-spotify-green-bright' : 'text-spotify-muted hover:text-white'
              )}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                flushStreamDuration();
                prevSong();
              }}
              className="text-spotify-muted hover:text-white transition-colors p-1"
              aria-label="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                flushStreamDuration();
                nextSong();
              }}
              className="text-spotify-muted hover:text-white transition-colors p-1"
              aria-label="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={cn(
                'p-1.5 transition-colors relative',
                repeatMode !== 'off'
                  ? 'text-spotify-green hover:text-spotify-green-bright'
                  : 'text-spotify-muted hover:text-white'
              )}
              aria-label="Toggle repeat"
            >
              <RepeatIcon className="w-4 h-4" />
              {repeatMode !== 'off' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[11px] text-spotify-muted tabular-nums min-w-[40px] text-right">
              {formatDuration(displayTime)}
            </span>

            <div
              ref={progressRef}
              className="flex-1 h-3 flex items-center cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div className="w-full h-1 bg-white/20 rounded-full relative group-hover:h-1.5 transition-all">
                <div
                  className="absolute left-0 top-0 h-full bg-white group-hover:bg-spotify-green rounded-full transition-colors"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, marginLeft: '-6px' }}
                />
              </div>
            </div>

            <span className="text-[11px] text-spotify-muted tabular-nums min-w-[40px]">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right — Volume + Queue */}
        <div className="w-[30%] min-w-[180px] flex items-center justify-end gap-2">
          <button
            onClick={toggleQueue}
            className={cn(
              'p-1.5 transition-colors',
              isQueueOpen ? 'text-spotify-green' : 'text-spotify-muted hover:text-white'
            )}
            aria-label="Toggle queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 w-[140px]">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="text-spotify-muted hover:text-white transition-colors p-1"
              aria-label="Toggle mute"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>

            <div
              ref={volumeRef}
              className="flex-1 h-3 flex items-center cursor-pointer group"
              onClick={handleVolumeClick}
            >
              <div className="w-full h-1 bg-white/20 rounded-full relative group-hover:h-1.5 transition-all">
                <div
                  className="absolute left-0 top-0 h-full bg-white group-hover:bg-spotify-green rounded-full transition-colors"
                  style={{ width: `${volume * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${volume * 100}%`, marginLeft: '-6px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Player Bar — Compact */}
      <div
        className="fixed bottom-14 left-0 right-0 h-16 bg-spotify-dark/95 backdrop-blur-lg border-t border-spotify-border/20 z-30 lg:hidden flex items-center px-3 gap-3"
        onClick={togglePlay}
      >
        {/* Album Art */}
        <div className="w-11 h-11 bg-spotify-card rounded-md overflow-hidden shrink-0">
          {currentSong.album?.cover_image ? (
            <img
              src={currentSong.album.cover_image}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-5 h-5 text-spotify-muted" />
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {currentSong.title}
          </p>
          <p className="text-xs text-spotify-muted truncate">
            {currentSong.artists?.map((a) => a.name).join(', ') || 'Unknown Artist'}
          </p>
        </div>

        {/* Like Button */}
        <div onClick={(e) => e.stopPropagation()}>
          <LikeButton
            songId={currentSong.id_song}
            isLiked={user?.liked_songs?.some((s) => s.id_song === currentSong.id_song) || false}
            size="md"
            className="p-1"
          />
        </div>

        {/* Play/Pause */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="shrink-0 p-1"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-current" />
          ) : (
            <Play className="w-6 h-6 text-white fill-current" />
          )}
        </button>

        {/* Progress bar at top of mobile player */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            className="h-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}
