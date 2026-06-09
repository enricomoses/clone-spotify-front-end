import Head from 'next/head';
import useSWR from 'swr';
import { Sparkles, Play } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import SongList from '@/components/song/SongList';
import { PageLoading } from '@/components/ui/Spinner';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { getWeekLabel } from '@/utils/discoverWeekly';
import type { Song } from '@/types';

export default function DiscoverWeeklyPage() {
  const { requireAuth } = useRequireAuth();
  const playSong = usePlayerStore((s) => s.playSong);

  const { data: songs, isLoading } = useSWR<Song[]>(
    '/songs/discover-weekly',
    fetcher
  );

  if (isLoading) return <PageLoading />;

  const songList = songs || [];

  return (
    <>
      <Head>
        <title>Discover Weekly — Spotify Clone</title>
        <meta name="description" content="Top 50 lagu minggu ini berdasarkan streaming trends" />
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex items-end gap-6 px-8 pt-24 pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #2563eb 100%)',
            minHeight: '340px',
          }}
        >
          {/* Cover Art */}
          <div className="w-56 h-56 shrink-0 rounded-lg overflow-hidden shadow-2xl shadow-black/50 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-24 h-24 text-white/80" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end">
            <p className="text-sm font-bold uppercase text-white/80 mb-1">
              Playlist
            </p>
            <h1 className="text-6xl font-black text-white mb-4 leading-tight">
              Discover Weekly
            </h1>
            <p className="text-sm text-white/70 max-w-lg">
              Your weekly mixtape of fresh music — top songs based on streaming
              trends. Updated every Monday.
            </p>
            <p className="text-xs text-white/50 mt-2">
              Week of {getWeekLabel()} • {songList.length} songs
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(76,29,149,.3), #121212)',
            }}
          />

          <div className="relative z-10 px-8 py-6">
            {/* Play All Button */}
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() =>
                  requireAuth(() => {
                    if (songList.length > 0) playSong(songList[0], songList);
                  })
                }
                className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                aria-label="Play all"
              >
                <Play className="w-6 h-6 text-black fill-current ml-0.5" />
              </button>
            </div>

            {songList.length > 0 ? (
              <SongList songs={songList} showAlbum={true} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Sparkles className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  No discoveries yet
                </h2>
                <p className="text-sm text-spotify-muted">
                  Start listening to music to get personalized recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
