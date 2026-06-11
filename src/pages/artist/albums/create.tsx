import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import api from '@/lib/axios';
import ImageUpload from '@/components/ui/ImageUpload';
import ArtistAutocomplete from '@/components/ui/ArtistAutocomplete';
import type { Artist } from '@/types';

const createAlbumSchema = z.object({
  title: z.string().min(1, 'Judul album wajib diisi'),
  release: z.string().min(1, 'Tanggal rilis wajib diisi'),
  cover_image: z.string().url('Cover image URL harus valid').optional().or(z.literal('')),
});

type CreateAlbumForm = z.infer<typeof createAlbumSchema>;

function CreateAlbumPage() {
  const router = useRouter();
  const artist = useArtistStore((s) => s.artist);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collaborating artists state — start with current artist
  const [collabArtists, setCollabArtists] = useState<Artist[]>(() =>
    artist ? [artist] : []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAlbumForm>({
    resolver: zodResolver(createAlbumSchema),
  });

  const coverImage = watch('cover_image');

  const handleAddArtist = (a: Artist) => {
    setCollabArtists((prev) => [...prev, a]);
  };

  const handleRemoveArtist = (artistId: string) => {
    setCollabArtists((prev) => prev.filter((a) => a.id_artist !== artistId));
  };

  const onSubmit = async (data: CreateAlbumForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/albums', {
        ...data,
        cover_image: data.cover_image || undefined,
        artist_ids: collabArtists.map((a) => a.id_artist),
      });
      router.push('/artist/albums');
    } catch (err: any) {
      setError('Failed to create album. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Album — Spotify for Artists</title>
      </Head>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Album</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Album Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter album title"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Release Date *
            </label>
            <input
              {...register('release')}
              type="date"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.release && (
              <p className="mt-1 text-xs text-red-400">{errors.release.message}</p>
            )}
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
              folder="albums"
            />
            {errors.cover_image && (
              <p className="mt-1 text-xs text-red-400">{errors.cover_image.message}</p>
            )}
          </div>

          {/* Collaborating Artists */}
          <ArtistAutocomplete
            selectedArtists={collabArtists}
            onAdd={handleAddArtist}
            onRemove={handleRemoveArtist}
            lockedArtistId={artist?.id_artist}
            label="Collaborating Artists"
            placeholder="Search artists to collaborate..."
          />

          {/* Buttons */}
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
              {isSubmitting ? 'Creating...' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withArtistAuth(CreateAlbumPage);
