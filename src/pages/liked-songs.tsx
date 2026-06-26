import Head from 'next/head';
import { Heart, Play, Music, Clock } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import SongList from '@/components/song/SongList';
import { BannerSkeleton } from '@/components/ui/SkeletonCard';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { User } from '@/types';

function LikedSongsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const playSong = usePlayerStore((s) => s.playSong);

  const { data: userData, isLoading } = useSWR<User>(
    currentUser ? `/users/${currentUser.id_user}` : null,
    fetcher
  );

  if (!currentUser) return null;

  if (isLoading) return <BannerSkeleton />;

  const likedSongs = userData?.liked_songs || currentUser?.liked_songs || [];

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  return (
    <>
      <Head>
        <title>Liked Songs — Spotify Clone</title>
        <meta name="description" content="Your liked songs collection" />
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 px-4 sm:px-8 pt-20 sm:pt-24 pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #5038a0 0%, #2e1065 50%, #1a0a3e 100%)',
            minHeight: '300px',
          }}
        >
          {/* Icon */}
          <div className="w-32 h-32 sm:w-56 sm:h-56 shrink-0 rounded-md overflow-hidden shadow-2xl shadow-black/50 bg-gradient-to-br from-[#4a17c8] to-[#8e5ae5] flex items-center justify-center">
            <Heart className="w-16 h-16 sm:w-24 sm:h-24 text-white fill-white drop-shadow-lg" />
          </div>

          {/* Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              Playlist
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
              Liked Songs
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="font-bold text-white">{currentUser.name}</span>
              <span>•</span>
              <span>{likedSongs.length} songs</span>
            </div>
          </div>
        </div>

        {/* Controls + Songs */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(80,56,160,.3), #121212)',
            }}
          />

          <div className="relative z-10 px-4 sm:px-8 py-6">
            {/* Play All */}
            {likedSongs.length > 0 && (
              <div className="flex items-center gap-6 mb-6">
                <button
                  onClick={handlePlayAll}
                  className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                  aria-label="Play all liked songs"
                >
                  <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                </button>
              </div>
            )}

            {/* Songs List */}
            {likedSongs.length > 0 ? (
              <div className="max-w-4xl">
                <SongList songs={likedSongs} showAlbum={true} showHeader={true} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Heart className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  Songs you like will appear here
                </h2>
                <p className="text-sm text-spotify-muted">
                  Save songs by tapping the heart icon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(LikedSongsPage);
