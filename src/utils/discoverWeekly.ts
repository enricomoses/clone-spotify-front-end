import api from '@/lib/axios';
import type { Song, StreamingHistory } from '@/types';

/**
 * Calculates the Discover Weekly playlist — top 50 most streamed songs
 * in the last 7 days, based on streaming history.
 */
export async function getDiscoverWeekly(): Promise<Song[]> {
  try {
    // 1. Fetch all streaming history
    const historyRes = await api.get('/streaming-history');
    const history: StreamingHistory[] = historyRes.data.data || historyRes.data || [];

    // 2. Filter last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = history.filter(
      (h) => new Date(h.played_at) >= sevenDaysAgo
    );

    // 3. Count streams per song
    const songStreamCount: Record<string, number> = {};
    recent.forEach((h) => {
      songStreamCount[h.id_song] = (songStreamCount[h.id_song] || 0) + 1;
    });

    // 4. Sort descending and take top 50
    const top50Ids = Object.entries(songStreamCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([id_song]) => id_song);

    if (top50Ids.length === 0) {
      // Fallback: return random songs if no streaming history
      const songsRes = await api.get('/songs');
      const allSongs: Song[] = songsRes.data.data || songsRes.data || [];
      return allSongs.slice(0, 50);
    }

    // 5. Fetch all songs and filter by top 50
    const songsRes = await api.get('/songs');
    const allSongs: Song[] = songsRes.data.data || songsRes.data || [];

    return allSongs
      .filter((s) => top50Ids.includes(s.id_song))
      .sort(
        (a, b) => top50Ids.indexOf(a.id_song) - top50Ids.indexOf(b.id_song)
      );
  } catch (error) {
    console.error('Error fetching Discover Weekly:', error);
    // Fallback: return all songs
    try {
      const songsRes = await api.get('/songs');
      const allSongs: Song[] = songsRes.data.data || songsRes.data || [];
      return allSongs.slice(0, 50);
    } catch {
      return [];
    }
  }
}

/**
 * Gets the current week label (the Monday date of the current week).
 */
export function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
