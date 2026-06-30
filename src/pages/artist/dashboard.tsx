import Head from 'next/head';
import useSWR from 'swr';
import { Music, Disc3, TrendingUp, BarChart3, Play, Calendar } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import { ArtistDashboardSkeleton } from '@/components/ui/SkeletonCard';
import AnalyticsChart from '@/components/artist-portal/AnalyticsChart';
import type { Song } from '@/types';
import Link from 'next/link';

interface DashboardData {
  total_songs: number;
  total_albums: number;
  total_streams: number;
  weekly_streams: number;
  top_5_songs: { song: Song; count: number }[];
  stream_distribution: { id: string; title: string; count: number }[];
}

function ArtistDashboardPage() {
  const artist = useArtistStore((s) => s.artist);

  // Single optimized endpoint — all stats computed server-side
  const { data: dashboardData, isLoading } = useSWR<DashboardData>(
    artist ? `/artists/${artist.id_artist}/dashboard` : null,
    fetcher
  );

  if (isLoading) return <ArtistDashboardSkeleton />;

  const data = dashboardData || {
    total_songs: 0,
    total_albums: 0,
    total_streams: 0,
    weekly_streams: 0,
    top_5_songs: [],
    stream_distribution: [],
  };

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
              {data.total_songs}
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
              {data.total_albums}
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
              {data.total_streams.toLocaleString()}
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
              {data.weekly_streams.toLocaleString()}
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
            {data.top_5_songs.length > 0 ? (
              <div className="space-y-3">
                {data.top_5_songs.map((item, idx) => (
                  <div
                    key={item.song?.id_song || idx}
                    className="flex items-center gap-3 py-2"
                  >
                    <span className="w-6 text-center text-sm font-bold text-spotify-muted">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.song?.title || 'Unknown'}
                      </p>
                      <p className="text-xs text-spotify-muted">
                        {item.song?.album?.title || 'Single'}
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
            <AnalyticsChart chartData={data.stream_distribution} />
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
