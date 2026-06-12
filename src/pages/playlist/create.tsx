import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Music, Loader2 } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import type { PlaylistCategory } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToastStore } from '@/components/ui/Toast';

const createPlaylistSchema = z.object({
  name: z.string().min(1, 'Nama playlist wajib diisi'),
  description: z.string().optional(),
  cover_image: z.string().url('URL tidak valid').optional().or(z.literal('')),
  id_playlist_category: z.string().optional(),
});

type CreatePlaylistForm = z.infer<typeof createPlaylistSchema>;

function CreatePlaylistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const { data: categories } = useSWR<PlaylistCategory[]>(
    '/playlist-categories',
    fetcher
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePlaylistForm>({
    resolver: zodResolver(createPlaylistSchema),
  });

  const coverImage = watch('cover_image');

  const onSubmit = async (data: CreatePlaylistForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...data,
        id_user: user?.id_user,
        cover_image: data.cover_image || undefined,
        id_playlist_category: data.id_playlist_category || undefined,
      };

      const response = await api.post('/playlists', payload);
      const newPlaylist = response.data.data || response.data;
      addToast('Playlist berhasil dibuat!', 'success');
      router.push(`/playlist/${newPlaylist.id_playlist}`);
    } catch (err: any) {
      setError('Failed to create playlist. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Playlist — Spotify Clone</title>
      </Head>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Create Playlist</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-6">
            {/* Cover Preview */}
            <div className="w-48 h-48 shrink-0 bg-spotify-card rounded-lg overflow-hidden flex items-center justify-center shadow-xl">
              {coverImage ? (
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-12 h-12 text-spotify-muted" />
              )}
            </div>

            <div className="flex-1 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="My Playlist"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Add an optional description"
                  rows={3}
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
                />
              </div>
            </div>
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
              <p className="mt-1 text-xs text-red-400">
                {errors.cover_image.message}
              </p>
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

          {/* Submit */}
          <div className="flex gap-4 pt-4">
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
              {isSubmitting ? 'Creating' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withAuth(CreatePlaylistPage);
