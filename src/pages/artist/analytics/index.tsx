import { useMemo } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import { formatDuration } from '@/utils/formatDuration';
import AnalyticsChart from '@/components/artist-portal/AnalyticsChart';
import { GridSkeleton } from '@/components/ui/SkeletonCard';
import type { Song, StreamingHistory } from '@/types';

function ArtistAnalyticsPage() {
  const artist = useArtistStore((s) => s.artist);

  const { data: allSongs, isLoading: songsLoading } = useSWR<Song[]>(
    '/songs',
    fetcher
  );
  const { data: allHistory, isLoading: historyLoading } = useSWR<
    StreamingHistory[]
  >('/streaming-history', fetcher);

  const isLoading = songsLoading || historyLoading;

  const artistSongs = useMemo(() => {
    if (!allSongs || !artist) return [];
    return allSongs.filter(
      (s) =>
        s.artists?.some((a) => a.id_artist === artist.id_artist) ||
        s.album?.artists?.some((a) => a.id_artist === artist.id_artist)
    );
  }, [allSongs, artist]);

  const artistHistory = useMemo(() => {
    if (!allHistory || artistSongs.length === 0) return [];
    const songIds = new Set(artistSongs.map((s) => s.id_song));
    return allHistory.filter((h) => songIds.has(h.id_song));
  }, [allHistory, artistSongs]);

  // Table data: per-song stream counts
  const tableData = useMemo(() => {
    const countsAll: Record<string, number> = {};
    const countsWeek: Record<string, number> = {};
    const countsToday: Record<string, number> = {};

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    artistHistory.forEach((h) => {
      const playedAt = new Date(h.played_at);
      countsAll[h.id_song] = (countsAll[h.id_song] || 0) + 1;
      if (playedAt >= sevenDaysAgo) {
        countsWeek[h.id_song] = (countsWeek[h.id_song] || 0) + 1;
      }
      if (playedAt >= todayStart) {
        countsToday[h.id_song] = (countsToday[h.id_song] || 0) + 1;
      }
    });

    return artistSongs
      .map((song) => ({
        song,
        total: countsAll[song.id_song] || 0,
        weekly: countsWeek[song.id_song] || 0,
        today: countsToday[song.id_song] || 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [artistSongs, artistHistory]);

  if (isLoading) return <GridSkeleton count={6} />;

  return (
    <>
      <Head>
        <title>Analytics — Spotify for Artists</title>
      </Head>

      <div>
        <h1 className="text-2xl font-bold text-white mb-6">
          Streaming Analytics
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-5">
            <TrendingUp className="w-5 h-5 text-spotify-green mb-2" />
            <p className="text-2xl font-bold text-white">
              {artistHistory.length.toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted">Total Streams</p>
          </div>
          <div className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-5">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {tableData.reduce((sum, d) => sum + d.weekly, 0).toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted">This Week</p>
          </div>
          <div className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-5">
            <Clock className="w-5 h-5 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {tableData.reduce((sum, d) => sum + d.today, 0).toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted">Today</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-spotify-green" />
            Top Songs by Streams
          </h2>
          <AnalyticsChart history={artistHistory} songs={artistSongs} />
        </div>

        {/* Detailed Table */}
        <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-spotify-border/20">
            <h2 className="text-lg font-bold text-white">
              Detailed Breakdown
            </h2>
          </div>

          {tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-spotify-border/20">
                    <th className="px-6 py-3 text-left text-xs text-spotify-muted uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-spotify-muted uppercase tracking-wider">
                      Song
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-spotify-muted uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-right text-xs text-spotify-muted uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs text-spotify-muted uppercase tracking-wider">
                      This Week
                    </th>
                    <th className="px-6 py-3 text-right text-xs text-spotify-muted uppercase tracking-wider">
                      Today
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr
                      key={row.song.id_song}
                      className="border-b border-spotify-border/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-spotify-muted tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-white">
                          {row.song.title}
                        </p>
                        <p className="text-xs text-spotify-muted">
                          {row.song.album?.title || 'Single'}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-sm text-spotify-muted tabular-nums">
                        {formatDuration(row.song.duration)}
                      </td>
                      <td className="px-6 py-3 text-sm text-white text-right font-semibold tabular-nums">
                        {row.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-spotify-green text-right tabular-nums">
                        {row.weekly.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-blue-400 text-right tabular-nums">
                        {row.today.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-spotify-muted">
              No streaming data available.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default withArtistAuth(ArtistAnalyticsPage);
