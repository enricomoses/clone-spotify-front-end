import { useState } from 'react';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import GalleryGrid from '@/components/artist-portal/GalleryGrid';
import { PageLoading } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { ArtistGallery } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';

function ArtistGalleryPage() {
  const artist = useArtistStore((s) => s.artist);
  const { data: gallery, isLoading } = useSWR<ArtistGallery[]>(
    artist ? `/artists/${artist.id_artist}/gallery` : null,
    fetcher
  );

  console.log(gallery)

  const [showAddForm, setShowAddForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ArtistGallery | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async () => {
    if (!imageUrl || !artist) return;
    setIsAdding(true);

    try {
      await api.post(`/artists/${artist.id_artist}/gallery`, {
        image_url: imageUrl,
        description_pict: description || undefined,
      });
      mutate(`/artists/${artist.id_artist}/gallery`);
      setImageUrl('');
      setDescription('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add photo:', err);
      alert('Failed to add photo. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !artist) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.image_url) {
        try {
          await api.post('/media/delete', {
            image_url: deleteTarget.image_url,
            _method: 'DELETE',
          });
        } catch (cloudinaryErr) {
          console.warn('Failed to delete image from Cloudinary:', cloudinaryErr);
        }
      }

      await api.post(
        `/artists/${artist.id_artist}/gallery/${deleteTarget.id_gallery}`,
        { _method: 'DELETE' },
      );
      mutate(`/artists/${artist.id_artist}/gallery`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete photo:', err);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageLoading />;

  const photos = gallery || [];

  return (
    <>
      <Head>
        <title>Gallery — Spotify for Artists</title>
      </Head>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Photo Gallery</h1>
            <p className="text-sm text-spotify-muted mt-1">
              {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-spotify text-sm py-2.5 px-6 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-6 mb-6 animate-slide-up">
            <h3 className="text-sm font-bold text-white mb-4">
              Add New Photo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-spotify-muted mb-1.5">
                  Image
                </label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="gallery"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-spotify-muted mb-1.5">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Photo description"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn-outline text-xs py-2 px-5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!imageUrl || isAdding}
                  className="btn-spotify text-xs py-2 px-5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isAdding && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isAdding ? 'Adding...' : 'Add Photo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {photos.length > 0 ? (
          <GalleryGrid
            photos={photos}
            onDelete={setDeleteTarget}
            canManage={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <ImageIcon className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No photos yet
            </h2>
            <p className="text-sm text-spotify-muted mb-4">
              Add photos to showcase your artistry.
            </p>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Photo"
          description="Are you sure you want to delete this photo? This action cannot be undone."
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          variant="danger"
        />
      </div>
    </>
  );
}

export default withArtistAuth(ArtistGalleryPage);
