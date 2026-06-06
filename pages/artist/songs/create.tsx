import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import type { Album } from '@/types';

const createSongSchema = z.object({
  title: z.string().min(1, 'Judul lagu wajib diisi'),
  duration: z.coerce.number().min(1, 'Durasi harus lebih dari 0 detik'),
  id_album: z.string().optional(),
  audio_url: z.string().url('Audio URL harus valid').optional().or(z.literal('')),
});

type CreateSongForm = z.infer<typeof createSongSchema>;

function CreateSongPage() {
  const router = useRouter();
  const artist = useArtistStore((s) => s.artist);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allAlbums } = useSWR<Album[]>('/albums', fetcher);

  // Filter albums belonging to this artist
  const artistAlbums = useMemo(() => {
    if (!allAlbums || !artist) return [];
    return allAlbums.filter((a) =>
      a.artists?.some((ar) => ar.id_artist === artist.id_artist)
    );
  }, [allAlbums, artist]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSongForm>({
    resolver: zodResolver(createSongSchema),
  });

  const onSubmit = async (data: CreateSongForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: data.title,
        duration: data.duration,
        id_album: data.id_album || undefined,
        audio_url: data.audio_url || undefined,
      };

      await api.post('/songs', payload);
      router.push('/artist/songs');
    } catch (err: any) {
      setError('Failed to create song. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add Song — Spotify for Artists</title>
      </Head>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Add New Song</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Song Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter song title"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Duration (seconds) *
            </label>
            <input
              {...register('duration')}
              type="number"
              min="1"
              placeholder="e.g. 210"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-red-400">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Album */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Album
            </label>
            <select
              {...register('id_album')}
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            >
              <option value="">Single (no album)</option>
              {artistAlbums.map((album) => (
                <option key={album.id_album} value={album.id_album}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          {/* Audio URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Audio URL
            </label>
            <input
              {...register('audio_url')}
              type="url"
              placeholder="https://example.com/audio.mp3"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.audio_url && (
              <p className="mt-1 text-xs text-red-400">
                {errors.audio_url.message}
              </p>
            )}
          </div>

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
              {isSubmitting ? 'Adding...' : 'Add Song'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withArtistAuth(CreateSongPage);
