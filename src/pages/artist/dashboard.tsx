import Head from 'next/head';
import useSWR from 'swr';
import { Music, Disc3, TrendingUp, BarChart3, Play, Calendar } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import { ArtistDashboardSkeleton } from '@/components/ui/SkeletonCard';
import AnalyticsChart from '@/components/artist-portal/AnalyticsChart';
import type { Song, StreamingHistory, Album } from '@/types';
import { useMemo } from 'react';
import Link from 'next/link';

function ArtistDashboardPage() {
  const artist = useArtistStore((s) => s.artist);

  const { data: allSongs, isLoading: songsLoading } = useSWR<Song[]>(
    '/songs',
    fetcher
  );
  const { data: allAlbums } = useSWR<Album[]>('/albums', fetcher);
  const { data: allHistory, isLoading: historyLoading } = useSWR<
    StreamingHistory[]
  >(artist ? `/artists/${artist.id_artist}/song-streaming` : null, fetcher);

  const isLoading = songsLoading || historyLoading;

  // Filter songs belonging to this artist
  const artistSongs = useMemo(() => {
    if (!allSongs || !artist) return [];
    return allSongs.filter(
      (s) =>
        s.artists?.some((a) => a.id_artist === artist.id_artist) ||
        s.album?.artists?.some((a) => a.id_artist === artist.id_artist)
    );
  }, [allSongs, artist]);

  // Filter albums belonging to this artist
  const artistAlbums = useMemo(() => {
    if (!allAlbums || !artist) return [];
    return allAlbums.filter((a) =>
      a.artists?.some((ar) => ar.id_artist === artist?.id_artist)
    );
  }, [allAlbums, artist]);

  // Filter streaming history for artist's songs
  const artistHistory = useMemo(() => {
    if (!allHistory || artistSongs.length === 0) return [];
    const songIds = new Set(artistSongs.map((s) => s.id_song));
    return allHistory.filter((h) => songIds.has(h.id_song));
  }, [allHistory, artistSongs]);

  // Stats
  const totalStreams = artistHistory.length;

  const weeklyStreams = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return artistHistory.filter(
      (h) => new Date(h.played_at) >= sevenDaysAgo
    ).length;
  }, [artistHistory]);

  const todayStreams = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return artistHistory.filter(
      (h) => new Date(h.played_at) >= today
    ).length;
  }, [artistHistory]);

  // Top 5 songs
  const topSongs = useMemo(() => {
    const counts: Record<string, number> = {};
    artistHistory.forEach((h) => {
      counts[h.id_song] = (counts[h.id_song] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({
        song: artistSongs.find((s) => s.id_song === id),
        count,
      }))
      .filter((item) => item.song);
  }, [artistHistory, artistSongs]);

  if (isLoading) return <ArtistDashboardSkeleton />;

  return (
    <>
      <Head>
        <title>Dashboard — Spotify for Artists</title>
      </Head>

      <div>
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {artist?.name}
          </h1>
          <p className="text-spotify-muted text-sm">
            Here&apos;s an overview of your music performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-spotify-green/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-spotify-green" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {artistSongs.length}
            </p>
            <p className="text-xs text-spotify-muted mt-1">Total Songs</p>
          </div>

          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {artistAlbums.length}
            </p>
            <p className="text-xs text-spotify-muted mt-1">Total Albums</p>
          </div>

          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalStreams.toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted mt-1">
              Total Streams (All Time)
            </p>
          </div>

          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {weeklyStreams.toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted mt-1">
              Streams This Week
            </p>
          </div>
        </div>

        {/* Top Songs & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top 5 Songs */}
          <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-spotify-green" />
              Top 5 Songs
            </h2>
            {topSongs.length > 0 ? (
              <div className="space-y-3">
                {topSongs.map((item, idx) => (
                  <div
                    key={item.song!.id_song}
                    className="flex items-center gap-3 py-2"
                  >
                    <span className="w-6 text-center text-sm font-bold text-spotify-muted">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.song!.title}
                      </p>
                      <p className="text-xs text-spotify-muted">
                        {item.song!.album?.title || 'Single'}
                      </p>
                    </div>
                    <span className="text-sm text-spotify-green font-semibold tabular-nums">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-spotify-muted">
                No streaming data yet.
              </p>
            )}
          </div>

          {/* Streaming Chart */}
          <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Stream Distribution
            </h2>
            <AnalyticsChart
              history={artistHistory}
              songs={artistSongs}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/artist/songs"
            className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card/60 transition-colors group"
          >
            <Music className="w-6 h-6 text-spotify-green mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Manage Songs</h3>
            <p className="text-xs text-spotify-muted">
              Add, edit, or remove your songs
            </p>
          </Link>

          <Link
            href="/artist/albums"
            className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card/60 transition-colors group"
          >
            <Disc3 className="w-6 h-6 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Manage Albums</h3>
            <p className="text-xs text-spotify-muted">
              Create and organize your albums
            </p>
          </Link>

          <Link
            href="/artist/analytics"
            className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card/60 transition-colors group"
          >
            <BarChart3 className="w-6 h-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">View Analytics</h3>
            <p className="text-xs text-spotify-muted">
              Deep dive into your streaming data
            </p>
          </Link>

          <Link
            href="/artist/concerts"
            className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card/60 transition-colors group"
          >
            <Calendar className="w-6 h-6 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Manage Concerts</h3>
            <p className="text-xs text-spotify-muted">
              Create and manage your live events
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}

export default withArtistAuth(ArtistDashboardPage);
