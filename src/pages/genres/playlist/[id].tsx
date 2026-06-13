import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, Music, Play } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { BannerSkeleton } from '@/components/ui/SkeletonCard';
import type { PlaylistCategory, Playlist } from '@/types';

interface PlaylistCategoryWithPlaylists extends PlaylistCategory {
  playlists?: Playlist[];
}

export default function PlaylistGenreDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const playSong = usePlayerStore((s) => s.playSong);

  const { data: category, isLoading } = useSWR<PlaylistCategoryWithPlaylists>(
    id ? `/playlist-categories/${id}` : null,
    fetcher
  );

  if (isLoading || !category) return <BannerSkeleton />;

  const playlists = category.playlists || [];

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  return (
    <>
      <Head>
        <title>{category.name} — Spotify Clone</title>
        <meta name="description" content={`Browse ${category.name} playlists`} />
      </Head>

      <div className="-mt-[60px]">
        {/* Hero Banner */}
        <div
          className="relative px-4 sm:px-8 pt-20 pb-8 sm:pb-12"
          style={{
            background: category.cover_image
              ? `linear-gradient(transparent 0%, rgba(18,18,18,0.8) 70%, #121212 100%), url(${category.cover_image}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1DB954 0%, #064e3b 50%, #121212 100%)',
            minHeight: '340px',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => router.push('/genres')}
            className="absolute top-20 left-4 sm:left-8 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
            aria-label="Back to genres"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Genre Info */}
          <div className="flex flex-col justify-end h-full min-h-[180px] sm:min-h-[220px] relative z-10">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/70 mb-2 tracking-widest">
              Genre
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-2 leading-[0.95] drop-shadow-2xl">
              {category.name}
            </h1>
            <p className="text-sm text-white/70">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Gradient fade to page background */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-spotify-black to-transparent pointer-events-none" />
        </div>

        {/* Playlist Grid */}
        <div className="relative px-4 sm:px-8 pb-8">
          {/* Gradient continuation */}
          <div
            className="absolute inset-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(rgba(6,95,70,0.15), transparent)' }}
          />

          <div className="relative z-10">
            {playlists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {playlists.map((playlist) => (
                  <div key={playlist.id_playlist} className="group relative">
                    <Link
                      href={`/playlist/${playlist.id_playlist}`}
                      className="block bg-spotify-card/50 hover:bg-spotify-hover rounded-lg p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
                    >
                      {/* Cover Image */}
                      <div className="relative aspect-square mb-3 sm:mb-4 rounded-md overflow-hidden bg-spotify-dark shadow-lg shadow-black/40">
                        {playlist.cover_image ? (
                          <img
                            src={playlist.cover_image}
                            alt={playlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-800">
                            <Music className="w-10 h-10 sm:w-12 sm:h-12 text-white/60" />
                          </div>
                        )}

                        {/* Play button overlay */}
                        <button
                          onClick={(e) => handlePlayPlaylist(playlist, e)}
                          className="absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-xl shadow-black/40 opacity-0 translate-y-2 transition-all duration-300 hover:scale-110 hover:bg-spotify-green-bright group-hover:opacity-100 group-hover:translate-y-0"
                          aria-label={`Play ${playlist.name}`}
                        >
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-current ml-0.5" />
                        </button>
                      </div>

                      {/* Playlist Info */}
                      <p className="text-sm font-bold text-white truncate mb-1">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-spotify-muted line-clamp-2 leading-relaxed">
                        {playlist.description || `By ${playlist.owner?.name || 'Unknown'}`}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Music className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No playlists yet</h2>
                <p className="text-sm text-spotify-muted mb-4">
                  There are no playlists in this genre yet.
                </p>
                <Link
                  href="/genres"
                  className="flex items-center gap-2 text-sm text-spotify-green hover:text-spotify-green-bright transition-colors font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Genres
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
