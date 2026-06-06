import { useMemo } from 'react';
import type { StreamingHistory, Song } from '@/types';

interface AnalyticsChartProps {
  history: StreamingHistory[];
  songs: Song[];
}

/**
 * Simple bar chart showing streams per song (top 10).
 * Pure CSS implementation — no charting library needed.
 */
export default function AnalyticsChart({ history, songs }: AnalyticsChartProps) {
  const chartData = useMemo(() => {
    // Count streams per song
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      counts[h.id_song] = (counts[h.id_song] || 0) + 1;
    });

    // Map to song data and sort
    return Object.entries(counts)
      .map(([id_song, count]) => {
        const song = songs.find((s) => s.id_song === id_song);
        return {
          id: id_song,
          title: song?.title || 'Unknown',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [history, songs]);

  const maxCount = chartData.length > 0 ? chartData[0].count : 1;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-spotify-muted text-sm">
        No streaming data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chartData.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-3 group">
          <span className="w-6 text-xs text-spotify-muted text-right tabular-nums">
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white truncate font-medium">
                {item.title}
              </span>
              <span className="text-xs text-spotify-muted tabular-nums shrink-0 ml-2">
                {item.count.toLocaleString()} streams
              </span>
            </div>
            <div className="w-full h-2.5 bg-spotify-card rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-spotify-green to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
