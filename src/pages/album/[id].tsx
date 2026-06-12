import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { Play, Music } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePlayerStore } from '@/stores/usePlayerStore';
import SongList from '@/components/song/SongList';
import ShareButton from '@/components/social/ShareButton';
import { BannerSkeleton } from '@/components/ui/SkeletonCard';
import type { Album } from '@/types';

export default function AlbumDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const playSong = usePlayerStore((s) => s.playSong);
  const { requireAuth } = useRequireAuth();

  const { data: album, isLoading } = useSWR<Album>(
    id ? `/albums/${id}` : null,
    fetcher
  );

  if (isLoading || !album) return <BannerSkeleton />;

  const songCount = album.songs?.length || 0;

  const handlePlayAll = () => {
    requireAuth(() => {
      if (album.songs && album.songs.length > 0) {
        playSong(album.songs[0], album.songs);
      }
    });
  };

  return (
    <>
      <Head>
        <title>{album.title} — Spotify Clone</title>
        <meta name="description" content={`Album ${album.title} by ${album.artists?.map(a => a.name).join(', ')}`} />
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 px-4 sm:px-8 pt-20 pb-6 sm:pb-8"
          style={{
            background: 'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #1a365d 0%, #2d1b69 50%, #1a365d 100%)',
            minHeight: '340px',
          }}
        >
          {/* Album Cover */}
          <div className="w-36 h-36 sm:w-48 md:w-56 sm:h-48 md:h-56 shrink-0 rounded-md overflow-hidden shadow-2xl shadow-black/50">
            {album.cover_image ? (
              <img
                src={album.cover_image}
                alt={album.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                <Music className="w-16 h-16 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Album Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">Album</p>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 sm:mb-4 leading-tight">
              {album.title}
            </h1>
            <div className="flex items-center gap-1 text-sm text-white/80 flex-wrap">
              {/* Many-to-many artists */}
              {album.artists && album.artists.length > 0 ? (
                album.artists.map((artist, idx) => (
                  <span key={artist.id_artist}>
                    <Link
                      href={`/artist/${artist.id_artist}`}
                      className="font-bold text-white hover:underline"
                    >
                      {artist.name}
                    </Link>
                    {idx < album.artists!.length - 1 && <span>, </span>}
                  </span>
                ))
              ) : (
                <span className="font-bold text-white">Unknown Artist</span>
              )}
              {album.release && (
                <>
                  <span className="mx-1">•</span>
                  <span>{new Date(album.release).getFullYear()}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{songCount} songs</span>
            </div>
          </div>
        </div>

        {/* Controls + Track List */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(0,0,0,.6), #121212)',
            }}
          />

          <div className="relative z-10 px-4 sm:px-8 py-6">
            {/* Controls */}
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={handlePlayAll}
                className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                aria-label="Play all"
              >
                <Play className="w-6 h-6 text-black fill-current ml-0.5" />
              </button>
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={album.title}
              />
            </div>

            {/* Songs */}
            {album.songs && album.songs.length > 0 && (
              <SongList songs={album.songs} showAlbum={false} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
