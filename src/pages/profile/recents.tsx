import Head from 'next/head';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { History, Play, Clock, Music } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import SongList from '@/components/song/SongList';
import { BannerSkeleton } from '@/components/ui/SkeletonCard';
import { fetcher } from '@/lib/fetcher';
import { formatRelativeTime } from '@/utils/formatDuration';
import type { SongStreamingHistory, Song } from '@/types';

export default function RecentsPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const playSong = usePlayerStore((s) => s.playSong);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  // Fetch streaming history for the current user
  const { data: historyData, isLoading: historyLoading } = useSWR<SongStreamingHistory[]>(
    currentUser ? `/song-streaming?id_user=${currentUser.id_user}` : null,
    fetcher
  );

  // Fetch all songs to resolve full details (album, artists)
  const { data: allSongs, isLoading: songsLoading } = useSWR<Song[]>(
    '/songs',
    fetcher
  );

  const isLoading = historyLoading || songsLoading;

  // Process: sort by played_at descending, deduplicate songs (keep latest play)
  const recentSongs = useMemo(() => {
    if (!historyData || historyData.length === 0 || !allSongs || allSongs.length === 0) return [];

    // Create a map for fast lookup of full song details
    const songMap = new Map<string, Song>();
    allSongs.forEach((s) => {
      songMap.set(s.id_song, s);
    });

    // Sort by played_at descending (most recent first)
    const sorted = [...historyData].sort(
      (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
    );

    // Deduplicate: keep only the first (most recent) occurrence of each song
    const seen = new Set<string>();
    const uniqueSongs: Song[] = [];

    for (const entry of sorted) {
      const fullSong = songMap.get(entry.id_song);
      if (fullSong && !seen.has(entry.id_song)) {
        seen.add(entry.id_song);
        uniqueSongs.push({
          ...fullSong,
          last_played_at: entry.played_at,
        });
      }
    }

    return uniqueSongs;
  }, [historyData, allSongs]);

  if (!currentUser) return null;

  if (isLoading) return <BannerSkeleton />;

  const handlePlayAll = () => {
    if (recentSongs.length > 0) {
      playSong(recentSongs[0], recentSongs);
    }
  };

  // Get the total count and last played time
  const totalPlays = historyData?.length || 0;
  const lastPlayed = historyData && historyData.length > 0
    ? formatRelativeTime(
        [...historyData].sort(
          (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
        )[0].played_at
      )
    : null;

  return (
    <>
      <Head>
        <title>Recently Played — Spotify Clone</title>
        <meta name="description" content="Your recently played songs history" />
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 px-4 sm:px-8 pt-20 sm:pt-24 pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #0e7490 0%, #164e63 50%, #0c1a2e 100%)',
            minHeight: '300px',
          }}
        >
          {/* Icon */}
          <div className="w-32 h-32 sm:w-56 sm:h-56 shrink-0 rounded-md overflow-hidden shadow-2xl shadow-black/50 bg-gradient-to-br from-cyan-600 to-teal-800 flex items-center justify-center">
            <History className="w-16 h-16 sm:w-24 sm:h-24 text-white drop-shadow-lg" />
          </div>

          {/* Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              History
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
              Recently Played
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/70 flex-wrap justify-center sm:justify-start">
              <span className="font-bold text-white">{currentUser.name}</span>
              <span>•</span>
              <span>{recentSongs.length} songs</span>
              {totalPlays > 0 && (
                <>
                  <span>•</span>
                  <span>{totalPlays} total plays</span>
                </>
              )}
              {lastPlayed && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last played {lastPlayed}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls + Songs */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(14,116,144,.3), #121212)',
            }}
          />

          <div className="relative z-10 px-4 sm:px-8 py-6">
            {/* Play All */}
            {recentSongs.length > 0 && (
              <div className="flex items-center gap-6 mb-6">
                <button
                  onClick={handlePlayAll}
                  className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                  aria-label="Play all recently played songs"
                >
                  <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                </button>
              </div>
            )}

            {/* Songs List */}
            {recentSongs.length > 0 ? (
              <div className="max-w-4xl">
                <SongList songs={recentSongs} showAlbum={true} showHeader={true} showLastPlayed={true} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <History className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  No recently played songs
                </h2>
                <p className="text-sm text-spotify-muted">
                  Start listening to music and your history will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
