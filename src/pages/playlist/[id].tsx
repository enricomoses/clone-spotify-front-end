import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import {
  Play,
  Music,
  MoreHorizontal,
  Plus,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import SongList from '@/components/song/SongList';
import FollowButton from '@/components/social/FollowButton';
import ShareButton from '@/components/social/ShareButton';
import { PageLoading } from '@/components/ui/Spinner';
import type { Playlist } from '@/types';
import api from '@/lib/axios';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AddSongToPlaylistModal from '@/components/playlist/AddSongToPlaylistModal';
import AddCollaboratorModal from '@/components/playlist/AddCollaboratorModal';

export default function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const playSong = usePlayerStore((s) => s.playSong);
  const { requireAuth, user } = useRequireAuth();
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingSongId, setRemovingSongId] = useState<string | null>(null);

  const refreshUser = useAuthStore((s) => s.refreshUser);

  const { data: playlist, isLoading } = useSWR<Playlist>(
    id ? `/playlists/${id}` : null,
    fetcher,
  );

  if (isLoading || !playlist) return <PageLoading />;

  const songCount = playlist.songs?.length || 0;

  // Determine owner from collaborators with role 'Owner'
  const owner = playlist.collaborators?.find((c) => c.pivot?.role === 'Owner');
  const ownerName =
    owner?.name || owner?.user?.name || playlist.owner?.name || 'User';

  // Check if current user is Owner or Editor
  const userRole = user
    ? playlist.collaborators?.find((c) => c.id_user === user.id_user)?.pivot
        ?.role
    : null;
  const canEdit = userRole === 'Owner' || userRole === 'Editor';
  const isOwner = userRole === 'Owner';

  // Check if user follows this playlist
  const isFollowing =
    user?.followed_playlists?.some(
      (p) => p.id_playlist === playlist.id_playlist,
    ) || false;

  const handlePlayAll = () => {
    requireAuth(() => {
      if (playlist.songs && playlist.songs.length > 0) {
        playSong(playlist.songs[0], playlist.songs);
      }
    });
  };

  const handleFollow = async () => {
    if (!user) return;
    try {
      await api.post(`/users/${user.id_user}/follow-playlist`, {
        playlist_id: playlist.id_playlist,
      });
      await refreshUser();
    } catch (e) {
      console.error('Failed to follow playlist', e);
      throw e;
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      await api.post(
        `/users/${user.id_user}/unfollow-playlist/${playlist.id_playlist}`,
        { _method: 'DELETE' },
      );
      await refreshUser();
    } catch (e) {
      console.error('Failed to unfollow playlist', e);
      throw e;
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!user) return;
    setRemovingSongId(songId);
    try {
      await api.post(`/playlists/${id}/songs/${songId}`, {
        _method: 'DELETE',
        id_user: user.id_user,
      });
      mutate(`/playlists/${id}`);
    } catch (e) {
      console.error('Failed to remove song', e);
    } finally {
      setRemovingSongId(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await api.post(`/playlists/${id}?id_user=${user.id_user}`, {
        _method: 'DELETE',
      });
      await refreshUser();
      router.push('/home');
    } catch (e) {
      console.error('Failed to delete playlist', e);
      alert('Gagal menghapus playlist. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Head>
        <title>{playlist.name} — Spotify Clone</title>
        <meta
          name="description"
          content={playlist.description || `Playlist ${playlist.name}`}
        />
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
                <Music className="w-16 h-16 text-spotify-muted" />
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
              <span className="font-bold text-white">{ownerName}</span>
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
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handlePlayAll}
                className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                aria-label="Play all"
              >
                <Play className="w-6 h-6 text-black fill-current ml-0.5" />
              </button>

              {/* Follow button (if not owner) */}
              {userRole !== 'Owner' && (
                <FollowButton
                  key={`${playlist.id_playlist}-${isFollowing}`}
                  isFollowing={isFollowing}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  size="sm"
                />
              )}

              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={playlist.name}
              />

              {/* Add Song button */}
              {canEdit && (
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition-colors"
                  title="Add Songs"
                >
                  <Plus className="w-4 h-4" />
                  Add Songs
                </button>
              )}

              {/* Manage Collaborators button */}
              {isOwner && (
                <button
                  onClick={() => setShowCollaboratorModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition-colors"
                  title="Manage Collaborators"
                >
                  <UserPlus className="w-4 h-4" />
                  Collaborators
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => router.push(`/playlist/${id}/edit`)}
                  className="text-spotify-muted hover:text-white transition-colors"
                  aria-label="More options"
                  title="Edit Playlist"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-spotify-muted hover:text-red-500 transition-colors"
                  aria-label="Delete playlist"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-6 h-6" />
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
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-white flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3 h-3 text-spotify-muted" />
                      {c.name || c.user?.name || c.id_user}{' '}
                      <span
                        className={`font-semibold ${
                          c.pivot?.role === 'Owner'
                            ? 'text-spotify-green'
                            : c.pivot?.role === 'Editor'
                              ? 'text-blue-400'
                              : 'text-spotify-muted'
                        }`}
                      >
                        {c.pivot?.role}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Songs */}
            {playlist.songs && playlist.songs.length > 0 ? (
              <div>
                <SongList songs={playlist.songs} showAlbum={true} />
                {/* Remove song buttons */}
                {canEdit && (
                  <div className="mt-4 space-y-1">
                    <p className="text-xs uppercase font-semibold text-spotify-muted tracking-wider mb-2">
                      Manage Songs
                    </p>
                    {playlist.songs.map((song) => (
                      <div
                        key={song.id_song}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded bg-spotify-hover overflow-hidden shrink-0">
                            {song.album?.cover_image ? (
                              <img
                                src={song.album.cover_image}
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-3.5 h-3.5 text-spotify-muted" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-white truncate">
                            {song.title}
                          </span>
                          <span className="text-xs text-spotify-muted truncate">
                            {song.artists?.map((a) => a.name).join(', ')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveSong(song.id_song)}
                          disabled={removingSongId === song.id_song}
                          className="p-1.5 text-spotify-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove from playlist"
                        >
                          {removingSongId === song.id_song ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Music className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  This playlist is empty
                </h2>
                <p className="text-sm text-spotify-muted mb-4">
                  Search for songs to add to this playlist.
                </p>
                {canEdit && (
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Songs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePlaylist}
        title="Hapus Playlist"
        description={`Apakah Anda yakin ingin menghapus playlist "${playlist.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Hapus'}
        variant="danger"
      />

      <AddSongToPlaylistModal
        playlistId={playlist.id_playlist}
        existingSongIds={playlist.songs?.map((s) => s.id_song) || []}
        isOpen={showAddSongModal}
        onClose={() => setShowAddSongModal(false)}
      />

      {playlist.collaborators && (
        <AddCollaboratorModal
          playlistId={playlist.id_playlist}
          collaborators={playlist.collaborators}
          isOpen={showCollaboratorModal}
          onClose={() => setShowCollaboratorModal(false)}
        />
      )}
    </>
  );
}
