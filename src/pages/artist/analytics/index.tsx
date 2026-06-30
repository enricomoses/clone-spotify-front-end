import Head from 'next/head';
import useSWR from 'swr';
import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import { formatDuration } from '@/utils/formatDuration';
import AnalyticsChart from '@/components/artist-portal/AnalyticsChart';
import { ArtistAnalyticsSkeleton } from '@/components/ui/SkeletonCard';
import type { Song } from '@/types';

interface AnalyticsData {
  total_streams: number;
  weekly_streams: number;
  today_streams: number;
  top_songs_by_stream: { id: string; title: string; count: number }[];
  detailed_breakdown: { song: Song; total: number; weekly: number; today: number }[];
}

function ArtistAnalyticsPage() {
  const artist = useArtistStore((s) => s.artist);

  // Single optimized endpoint — all analytics computed server-side
  const { data: analyticsData, isLoading } = useSWR<AnalyticsData>(
    artist ? `/artists/${artist.id_artist}/analytics` : null,
    fetcher
  );

  if (isLoading) return <ArtistAnalyticsSkeleton />;

  const data = analyticsData || {
    total_streams: 0,
    weekly_streams: 0,
    today_streams: 0,
    top_songs_by_stream: [],
    detailed_breakdown: [],
  };

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
              {data.total_streams.toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted">Total Streams</p>
          </div>
          <div className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-5">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {data.weekly_streams.toLocaleString()}
            </p>
            <p className="text-xs text-spotify-muted">This Week</p>
          </div>
          <div className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-5">
            <Clock className="w-5 h-5 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {data.today_streams.toLocaleString()}
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
          <AnalyticsChart chartData={data.top_songs_by_stream} />
        </div>

        {/* Detailed Table */}
        <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-spotify-border/20">
            <h2 className="text-lg font-bold text-white">
              Detailed Breakdown
            </h2>
          </div>

          {data.detailed_breakdown.length > 0 ? (
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
                  {data.detailed_breakdown.map((row, idx) => (
                    <tr
                      key={row.song?.id_song || idx}
                      className="border-b border-spotify-border/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-spotify-muted tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-white">
                          {row.song?.title || 'Unknown'}
                        </p>
                        <p className="text-xs text-spotify-muted">
                          {row.song?.album?.title || 'Single'}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-sm text-spotify-muted tabular-nums">
                        {row.song?.duration ? formatDuration(row.song.duration) : '-'}
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
