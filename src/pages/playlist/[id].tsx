import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { Play, Music2, Clock, MoreHorizontal } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import SongList from '@/components/song/SongList';
import ShareButton from '@/components/social/ShareButton';
import { PageLoading } from '@/components/ui/Spinner';
import type { Playlist } from '@/types';

function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const playSong = usePlayerStore((s) => s.playSong);
  const user = useAuthStore((s) => s.user);

  const { data: playlist, isLoading } = useSWR<Playlist>(
    id ? `/playlists/${id}` : null,
    fetcher
  );

  if (isLoading || !playlist) return <PageLoading />;

  const songCount = playlist.songs?.length || 0;
  const isOwner = playlist.id_user === user?.id_user;

  const handlePlayAll = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  return (
    <>
      <Head>
        <title>{playlist.name} — Spotify Clone</title>
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex items-end gap-6 px-8 pt-20 pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #065f46 0%, #064e3b 50%, #022c22 100%)',
            minHeight: '340px',
          }}
        >
          {/* Cover */}
          <div className="w-56 h-56 shrink-0 rounded-md overflow-hidden shadow-2xl shadow-black/50">
            {playlist.cover_image ? (
              <img
                src={playlist.cover_image}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-spotify-card to-spotify-hover flex items-center justify-center">
                <Music2 className="w-16 h-16 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end">
            <p className="text-sm font-bold uppercase text-white/80 mb-1">
              Playlist
            </p>
            <h1 className="text-5xl font-black text-white mb-3 leading-tight">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-sm text-white/70 mb-2 max-w-lg">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center gap-1 text-sm text-white/80">
              <span className="font-bold text-white">
                {playlist.owner?.name || 'User'}
              </span>
              {playlist.category && (
                <>
                  <span className="mx-1">•</span>
                  <span>{playlist.category.name}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{songCount} songs</span>
            </div>
          </div>
        </div>

        {/* Controls + Songs */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(6,95,70,.3), #121212)',
            }}
          />

          <div className="relative z-10 px-8 py-6">
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
                title={playlist.name}
              />

              {isOwner && (
                <button
                  onClick={() => router.push(`/playlist/${id}/edit`)}
                  className="text-spotify-muted hover:text-white transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Collaborators */}
            {playlist.collaborators && playlist.collaborators.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase font-semibold text-spotify-muted tracking-wider mb-2">
                  Collaborators
                </p>
                <div className="flex gap-2 flex-wrap">
                  {playlist.collaborators.map((c) => (
                    <span
                      key={c.id_user}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-white"
                    >
                      {c.user?.name || c.id_user}{' '}
                      <span className="text-spotify-muted">({c.role})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Songs */}
            {playlist.songs && playlist.songs.length > 0 ? (
              <SongList songs={playlist.songs} showAlbum={true} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Music2 className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  This playlist is empty
                </h2>
                <p className="text-sm text-spotify-muted">
                  Search for songs to add to this playlist.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(PlaylistDetailPage);
