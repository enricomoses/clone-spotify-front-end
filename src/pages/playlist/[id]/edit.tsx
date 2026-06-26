import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import type { Playlist, PlaylistCategory } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuthStore } from '@/stores/useAuthStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToastStore } from '@/components/ui/Toast';

const editPlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required'),
  description: z.string().optional(),
  cover_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  id_playlist_category: z.string().optional(),
});

type EditPlaylistForm = z.infer<typeof editPlaylistSchema>;

function EditPlaylistPage() {
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, refreshUser } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const { data: playlist, isLoading } = useSWR<Playlist>(
    id ? `/playlists/${id}` : null,
    fetcher
  );

  const { data: categories } = useSWR<PlaylistCategory[]>(
    '/playlist-categories',
    fetcher
  );

  // Check if current user is Owner
  const userRole = user && playlist
    ? playlist.collaborators?.find((c) => c.id_user === user.id_user)?.pivot?.role
    : null;
  const isOwner = userRole === 'Owner';

  const handleDeletePlaylist = async () => {
    if (!user) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.post(`/playlists/${id}?id_user=${user.id_user}`, {
        _method: 'DELETE',
      });
      await refreshUser();
      addToast('Playlist deleted successfully', 'success');
      router.push('/home');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
      addToast('Failed to delete playlist. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditPlaylistForm>({
    resolver: zodResolver(editPlaylistSchema),
  });

  const coverImage = watch('cover_image');

  useEffect(() => {
    if (playlist) {
      reset({
        name: playlist.name,
        description: playlist.description || '',
        cover_image: playlist.cover_image || '',
        id_playlist_category: playlist.id_playlist_category || '',
      });
    }
  }, [playlist, reset]);

  const onSubmit = async (data: EditPlaylistForm) => {
    if (!user) return;
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/playlists/${id}`, {
        ...data,
        id_user: user.id_user,
        cover_image: data.cover_image || undefined,
        id_playlist_category: data.id_playlist_category || undefined,
        _method: 'PUT',
      });
      router.push(`/playlist/${id}`);
      addToast('Playlist updated successfully', 'success');
    } catch (err: any) {
      setError('Failed to update playlist. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="h-8 w-40 bg-spotify-card/80 rounded animate-pulse mb-8" />
      <div className="space-y-6">
        <div className="h-12 bg-spotify-card/80 rounded animate-pulse" />
        <div className="h-20 bg-spotify-card/80 rounded animate-pulse" />
        <div className="h-12 bg-spotify-card/80 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Edit Playlist — Spotify Clone</title>
      </Head>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Playlist</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Cover Image
            </label>
            <input type="hidden" {...register('cover_image')} />
            <ImageUpload
              value={coverImage}
              onChange={(url) => setValue('cover_image', url, { shouldValidate: true })}
              folder="playlists"
            />
            {errors.cover_image && (
              <p className="mt-1 text-xs text-red-400">{errors.cover_image.message}</p>
            )}
          </div>

          {/* Category */}
          {categories && categories.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Category
              </label>
              <select
                {...register('id_playlist_category')}
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id_playlist_category} value={cat.id_playlist_category}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-outline text-sm py-2.5 px-8"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-spotify text-sm py-2.5 px-8 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 text-red-500 hover:text-white hover:bg-red-600 border border-red-500 hover:border-transparent rounded-full font-bold text-sm transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Playlist
              </button>
            )}
          </div>
        </form>
      </div>

      {playlist && (
        <ConfirmDialog
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePlaylist}
          title="Delete Playlist"
          description={`Are you sure you want to delete playlist "${playlist.name}"? This action cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

export default withAuth(EditPlaylistPage);
