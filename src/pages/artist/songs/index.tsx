import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { Plus, Music } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import SongManageRow from '@/components/artist-portal/SongManageRow';
import { ArtistSongsSkeleton } from '@/components/ui/SkeletonCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Song } from '@/types';
import { useToastStore } from '@/components/ui/Toast';

function ArtistSongsPage() {
  const artist = useArtistStore((s) => s.artist);
  const { data: allSongs, isLoading } = useSWR<Song[]>('/songs', fetcher);
  const addToast = useToastStore((s) => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter songs belonging to this artist
  const artistSongs = useMemo(() => {
    if (!allSongs || !artist) return [];
    return allSongs.filter(
      (s) =>
        s.artists?.some((a) => a.id_artist === artist.id_artist) ||
        s.album?.artists?.some((a) => a.id_artist === artist.id_artist)
    );
  }, [allSongs, artist]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      // Delete audio from Cloudinary first to free up storage
      if (deleteTarget.audio_url) {
        try {
          await api.post('/media/audio/delete', {
            audio_url: deleteTarget.audio_url,
            _method: 'DELETE',
          });
        } catch (err) {
          console.warn('Failed to delete audio from Cloudinary:', err);
          // Continue with song deletion even if Cloudinary cleanup fails
        }
      }

      await api.post(`/songs/${deleteTarget.id_song}`, { _method: 'DELETE' });
      mutate('/songs');
      addToast('Lagu berhasil dihapus!', 'success');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete song:', err);
      addToast('Gagal menghapus lagu. Silakan coba lagi.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <ArtistSongsSkeleton />;

  return (
    <>
      <Head>
        <title>Songs — Spotify for Artists</title>
      </Head>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Songs</h1>
            <p className="text-sm text-spotify-muted mt-1">
              {artistSongs.length} song{artistSongs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/artist/songs/create" className="btn-spotify text-sm py-2.5 px-6 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Song
          </Link>
        </div>

        {/* Table Header */}
        {artistSongs.length > 0 && (
          <div className="grid grid-cols-[40px_1fr_180px_100px_120px] items-center gap-4 px-4 py-2 border-b border-spotify-border/30 mb-2">
            <span className="text-xs text-spotify-muted text-center">#</span>
            <span className="text-xs text-spotify-muted uppercase tracking-wider">Title</span>
            <span className="text-xs text-spotify-muted uppercase tracking-wider">Album</span>
            <span className="text-xs text-spotify-muted uppercase tracking-wider">Duration</span>
            <span className="text-xs text-spotify-muted uppercase tracking-wider text-right">Actions</span>
          </div>
        )}

        {/* Song List */}
        {artistSongs.length > 0 ? (
          <div className="space-y-0.5">
            {artistSongs.map((song, idx) => (
              <SongManageRow
                key={song.id_song}
                song={song}
                index={idx}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Music className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No songs yet</h2>
            <p className="text-sm text-spotify-muted mb-4">
              Start by adding your first song.
            </p>
            <Link href="/artist/songs/create" className="btn-spotify text-sm py-2.5 px-6">
              Add Your First Song
            </Link>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Song"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          variant="danger"
        />
      </div>
    </>
  );
}

export default withArtistAuth(ArtistSongsPage);
