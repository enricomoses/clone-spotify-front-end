import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { Plus, Disc3, Edit, Trash2 } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import { ArtistAlbumsSkeleton } from '@/components/ui/SkeletonCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Album } from '@/types';
import { useToastStore } from '@/components/ui/Toast';

function ArtistAlbumsPage() {
  const artist = useArtistStore((s) => s.artist);

  // Fetch only this artist's albums from the optimized endpoint
  const { data: artistAlbums, isLoading } = useSWR<Album[]>(
    artist ? `/artists/${artist.id_artist}/albums` : null,
    fetcher
  );
  const addToast = useToastStore((s) => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.cover_image) {
        try {
          await api.post('/media/delete', {
            image_url: deleteTarget.cover_image,
            _method: 'DELETE',
          });
        } catch (cloudinaryErr) {
          console.warn('Failed to delete album cover from Cloudinary:', cloudinaryErr);
        }
      }

      await api.post(`/albums/${deleteTarget.id_album}`, {
        _method: 'DELETE',
      });
      mutate(`/artists/${artist?.id_artist}/albums`);
      addToast('Album deleted successfully!', 'success');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete album:', err);
      addToast('Failed to delete album. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <ArtistAlbumsSkeleton />;

  return (
    <>
      <Head>
        <title>Albums — Spotify for Artists</title>
      </Head>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Albums</h1>
            <p className="text-sm text-spotify-muted mt-1">
              {(artistAlbums?.length || 0)} album{(artistAlbums?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/artist/albums/create" className="btn-spotify text-sm py-2.5 px-6 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Album
          </Link>
        </div>

        {/* Albums Grid */}
        {artistAlbums && artistAlbums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artistAlbums.map((album) => (
              <div
                key={album.id_album}
                className="group bg-spotify-card/40 rounded-lg p-4 hover:bg-spotify-card transition-colors"
              >
                {/* Cover */}
                <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg shadow-black/30">
                  {album.cover_image ? (
                    <img
                      src={album.cover_image}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-spotify-hover flex items-center justify-center">
                      <Disc3 className="w-12 h-12 text-spotify-muted" />
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Link
                      href={`/artist/albums/${album.id_album}/edit`}
                      className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(album)}
                      className="p-2.5 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold text-white truncate mb-1">
                  {album.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-spotify-muted">
                  {album.release && (
                    <span>{new Date(album.release).getFullYear()}</span>
                  )}
                  {album.songs && (
                    <>
                      <span>•</span>
                      <span>{album.songs.length} songs</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Disc3 className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No albums yet</h2>
            <p className="text-sm text-spotify-muted mb-4">
              Create your first album to organize your songs.
            </p>
            <Link href="/artist/albums/create" className="btn-spotify text-sm py-2.5 px-6">
              Create First Album
            </Link>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Album"
          description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          variant="danger"
        />
      </div>
    </>
  );
}

export default withArtistAuth(ArtistAlbumsPage);
