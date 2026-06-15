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
  Mic2,
  ChevronDown,
  ChevronUp,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState, useCallback, useEffect } from 'react';
import api from '@/lib/axios';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import LikeButton from '@/components/song/LikeButton';

export default function PlayerBar() {
  const {
    currentSong,
    currentEpisode,
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
    setDuration,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleQueue,
    isQueueOpen,
    triggerSeek,
    isVideoExpanded,
    toggleVideoExpanded,
  } = usePlayerStore();

  const user = useAuthStore((s) => s.user);

  // Mount the audio engine — this drives actual Howler.js playback (for songs + audio-only episodes)
  useAudioEngine();

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Streaming history tracking
  const [streamId, setStreamId] = useState<string | null>(null);
  const [trackStartTime, setTrackStartTime] = useState<number>(0);
  const prevTrackRef = useRef<string | null>(null);

  // Determine what's currently playing
  const isEpisode = !!currentEpisode;
  const isVideoEpisode = isEpisode && !!currentEpisode?.video_url;
  const hasAnything = !!currentSong || !!currentEpisode;

  // Display info
  const displayTitle = currentSong?.title || currentEpisode?.title || '';
  const displaySubtitle = currentSong
    ? currentSong.artists?.map((a) => a.name).join(', ') ||
      currentSong.album?.artists?.map((a) => a.name).join(', ') ||
      'Unknown Artist'
    : currentEpisode?.podcast?.name || 'Podcast';
  const displayImage = currentSong?.album?.cover_image
    || currentEpisode?.thumbnail_image
    || currentEpisode?.podcast?.cover_image
    || null;
  const trackIdForHistory = currentSong?.id_song || currentEpisode?.id_episode || null;

  // ─── Video element sync ───────────────────────────────────────────
  // For video episodes, the <video> element drives time/duration updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoEpisode) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const handleEnded = () => {
      usePlayerStore.setState({ isPlaying: false, currentTime: 0 });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isVideoEpisode, currentEpisode?.id_episode, setCurrentTime, setDuration]);

  // Sync video play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoEpisode) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, isVideoEpisode]);

  // Sync video volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  // Seek video when seekTo changes (for video episodes)
  const videoSeekTo = usePlayerStore((s) => s.seekTo);
  useEffect(() => {
    if (videoSeekTo === null || videoSeekTo === undefined) return;
    if (!isVideoEpisode) return;

    const video = videoRef.current;
    if (video) {
      video.currentTime = videoSeekTo;
      setCurrentTime(videoSeekTo);
    }
    usePlayerStore.setState({ seekTo: null });
  }, [videoSeekTo, isVideoEpisode, setCurrentTime]);

  // Load new video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoEpisode || !currentEpisode?.video_url) return;

    video.src = currentEpisode.video_url;
    video.load();
    if (isPlaying) {
      video.play().catch(() => {});
    }
  }, [currentEpisode?.id_episode, currentEpisode?.video_url, isVideoEpisode]);

  // ─── Streaming history ────────────────────────────────────────────
  const streamEndpoint = isEpisode ? 'episode-streaming' : 'song-streaming';
  const streamPayloadKey = isEpisode ? 'id_episode' : 'id_song';

  // Flush stream duration to backend
  const flushStreamDuration = useCallback(async () => {
    if (!streamId || !user) return;
    const elapsed = Math.floor((Date.now() - trackStartTime) / 1000);
    if (elapsed >= 3) {
      try {
        await api.post(`/${streamEndpoint}/${streamId}`, {
          play_duration: elapsed,
          _method: 'PUT',
        });
      } catch (e) {
        console.error('Failed to update stream duration', e);
      }
    }
    setStreamId(null);
  }, [streamId, trackStartTime, user, streamEndpoint]);

  // Track changes for streaming history
  useEffect(() => {
    const currentId = trackIdForHistory;
    if (currentId !== prevTrackRef.current && currentId && isPlaying && user) {
      // Flush previous stream
      if (streamId) {
        flushStreamDuration();
      }

      // Start new stream
      const startStream = async () => {
        try {
          const res = await api.post(`/${streamEndpoint}`, {
            id_user: user.id_user,
            [streamPayloadKey]: currentId,
          });
          setStreamId(res.data.data.id_stream);
          setTrackStartTime(Date.now());
        } catch (e) {
          console.error('Failed to record stream start', e);
        }
      };
      startStream();
    }
    prevTrackRef.current = currentId;
  }, [trackIdForHistory, isPlaying]);

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
          const data = JSON.stringify({ play_duration: elapsed });
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          navigator.sendBeacon(
            `${baseUrl}/${streamEndpoint}/${streamId}`,
            new Blob([data], { type: 'application/json' })
          );
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [streamId, trackStartTime, user, streamEndpoint]);

  // Progress bar interaction
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = ratio * duration;

      // For video episodes, seek the video element directly
      if (isVideoEpisode && videoRef.current) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } else {
        triggerSeek(newTime);
      }
    },
    [duration, triggerSeek, isVideoEpisode, setCurrentTime]
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

  if (!hasAnything) {
    // Empty player bar
    return (
      <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 h-16 lg:h-[90px] bg-spotify-dark border-t border-spotify-border/30 z-30 flex items-center justify-center">
        <p className="text-sm text-spotify-muted/40">No song playing</p>
      </div>
    );
  }

  return (
    <>
      {/* ─── Video Player Panel (Desktop) ─── */}
      {isVideoEpisode && (
        <div
          className={cn(
            'fixed z-40 transition-all duration-300 ease-in-out',
            isVideoExpanded
              ? 'bottom-[90px] right-4 w-[400px] rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10'
              : 'bottom-[90px] right-4 w-[280px] rounded-xl overflow-hidden shadow-xl shadow-black/40 border border-white/10',
            'hidden lg:block'
          )}
        >
          {/* Video Header */}
          <div className="bg-spotify-dark/95 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">
                {currentEpisode?.title}
              </span>
            </div>
            <button
              onClick={toggleVideoExpanded}
              className="p-1 text-spotify-muted hover:text-white transition-colors shrink-0"
              aria-label={isVideoExpanded ? 'Minimize video' : 'Expand video'}
            >
              {isVideoExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Video Element */}
          <div className={cn(
            'bg-black transition-all duration-300',
            isVideoExpanded ? 'aspect-video' : 'h-0 overflow-hidden'
          )}>
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      )}

      {/* ─── Desktop Player Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-spotify-dark border-t border-spotify-border/30 z-30 hidden lg:flex items-center px-4">
        {/* Left — Now Playing Info */}
        <div className="w-[30%] min-w-[180px] flex items-center gap-3">
          <div className="w-14 h-14 bg-spotify-card rounded-md overflow-hidden shrink-0 shadow-lg relative">
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isEpisode ? (
                  <Mic2 className="w-6 h-6 text-spotify-muted" />
                ) : (
                  <Music className="w-6 h-6 text-spotify-muted" />
                )}
              </div>
            )}
            {/* Video badge */}
            {isVideoEpisode && (
              <div className="absolute bottom-0.5 right-0.5 bg-purple-500 rounded-sm p-0.5">
                <Video className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
              {displayTitle}
            </p>
            <p className="text-xs text-spotify-muted truncate">
              {displaySubtitle}
            </p>
          </div>
          {/* Like button only for songs */}
          {currentSong && (
            <LikeButton
              songId={currentSong.id_song}
              isLiked={user?.liked_songs?.some((s) => s.id_song === currentSong.id_song) || false}
              size="sm"
            />
          )}
        </div>

        {/* Center — Controls + Progress */}
        <div className="flex-1 max-w-[722px] flex flex-col items-center justify-center mx-4">
          {/* Control Buttons */}
          <div className="flex items-center gap-4 mb-1">
            {/* Shuffle — only for song queues */}
            <button
              onClick={toggleShuffle}
              className={cn(
                'p-1.5 transition-colors',
                isEpisode
                  ? 'text-spotify-muted/30 cursor-not-allowed'
                  : isShuffle
                    ? 'text-spotify-green hover:text-spotify-green-bright'
                    : 'text-spotify-muted hover:text-white'
              )}
              disabled={isEpisode}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                flushStreamDuration();
                prevSong();
              }}
              className={cn(
                'transition-colors p-1',
                isEpisode
                  ? 'text-spotify-muted/30 cursor-not-allowed'
                  : 'text-spotify-muted hover:text-white'
              )}
              disabled={isEpisode}
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
              className={cn(
                'transition-colors p-1',
                isEpisode
                  ? 'text-spotify-muted/30 cursor-not-allowed'
                  : 'text-spotify-muted hover:text-white'
              )}
              disabled={isEpisode}
              aria-label="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={cn(
                'p-1.5 transition-colors relative',
                isEpisode
                  ? 'text-spotify-muted/30 cursor-not-allowed'
                  : repeatMode !== 'off'
                    ? 'text-spotify-green hover:text-spotify-green-bright'
                    : 'text-spotify-muted hover:text-white'
              )}
              disabled={isEpisode}
              aria-label="Toggle repeat"
            >
              <RepeatIcon className="w-4 h-4" />
              {repeatMode !== 'off' && !isEpisode && (
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
                  className={cn(
                    'absolute left-0 top-0 h-full rounded-full transition-colors',
                    isEpisode
                      ? 'bg-white group-hover:bg-purple-400'
                      : 'bg-white group-hover:bg-spotify-green'
                  )}
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

        {/* Right — Volume + Queue + Video Toggle */}
        <div className="w-[30%] min-w-[180px] flex items-center justify-end gap-2">
          {/* Video toggle button */}
          {isVideoEpisode && (
            <button
              onClick={toggleVideoExpanded}
              className={cn(
                'p-1.5 transition-colors',
                isVideoExpanded ? 'text-purple-400' : 'text-spotify-muted hover:text-white'
              )}
              aria-label="Toggle video"
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          {!isEpisode && (
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
          )}

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

      {/* ─── Mobile Player Bar — Compact ─── */}
      <div
        className="fixed bottom-14 left-0 right-0 h-16 bg-spotify-dark/95 backdrop-blur-lg border-t border-spotify-border/20 z-30 lg:hidden flex items-center px-3 gap-3"
        onClick={togglePlay}
      >
        {/* Album Art / Thumbnail */}
        <div className="w-11 h-11 bg-spotify-card rounded-md overflow-hidden shrink-0 relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isEpisode ? (
                <Mic2 className="w-5 h-5 text-spotify-muted" />
              ) : (
                <Music className="w-5 h-5 text-spotify-muted" />
              )}
            </div>
          )}
          {isVideoEpisode && (
            <div className="absolute bottom-0.5 right-0.5 bg-purple-500 rounded-sm p-0.5">
              <Video className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {displayTitle}
          </p>
          <p className="text-xs text-spotify-muted truncate">
            {displaySubtitle}
          </p>
        </div>

        {/* Like Button (songs only) */}
        {currentSong && (
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton
              songId={currentSong.id_song}
              isLiked={user?.liked_songs?.some((s) => s.id_song === currentSong.id_song) || false}
              size="md"
              className="p-1"
            />
          </div>
        )}

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
            className={cn(
              'h-full',
              isEpisode ? 'bg-purple-400' : 'bg-white'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}
