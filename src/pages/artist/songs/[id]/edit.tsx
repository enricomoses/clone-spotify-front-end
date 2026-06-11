import { useState, useEffect, useMemo } from 'react';
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
import { PageLoading } from '@/components/ui/Spinner';
import type { Song, Album, Artist } from '@/types';
import ArtistAutocomplete from '@/components/ui/ArtistAutocomplete';

const editSongSchema = z.object({
  title: z.string().min(1, 'Judul lagu wajib diisi'),
  duration: z.coerce.number().min(1, 'Durasi harus lebih dari 0 detik'),
  id_album: z.string().optional(),
  audio_url: z.string().url('Audio URL harus valid').optional().or(z.literal('')),
});

type EditSongForm = z.infer<typeof editSongSchema>;

function EditSongPage() {
  const router = useRouter();
  const { id } = router.query;
  const artist = useArtistStore((s) => s.artist);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collaborating artists state
  const [collabArtists, setCollabArtists] = useState<Artist[]>([]);

  const { data: song, isLoading } = useSWR<Song>(
    id ? `/songs/${id}` : null,
    fetcher
  );

  const { data: allAlbums } = useSWR<Album[]>('/albums', fetcher);

  const artistAlbums = useMemo(() => {
    if (!allAlbums || !artist) return [];
    return allAlbums.filter((a) =>
      a.artists?.some((ar) => ar.id_artist === artist.id_artist)
    );
  }, [allAlbums, artist]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSongForm>({
    resolver: zodResolver(editSongSchema),
  });

  // Pre-fill form and collaborating artists when song data loads
  useEffect(() => {
    if (song) {
      reset({
        title: song.title,
        duration: song.duration,
        id_album: song.id_album || '',
        audio_url: song.audio_url || '',
      });
      // Pre-fill collab artists from song's existing artists
      if (song.artists && song.artists.length > 0) {
        setCollabArtists(song.artists);
      } else if (artist) {
        setCollabArtists([artist]);
      }
    }
  }, [song, reset, artist]);

  const handleAddArtist = (a: Artist) => {
    setCollabArtists((prev) => [...prev, a]);
  };

  const handleRemoveArtist = (artistId: string) => {
    setCollabArtists((prev) => prev.filter((a) => a.id_artist !== artistId));
  };

  const onSubmit = async (data: EditSongForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/songs/${id}`, {
        title: data.title,
        duration: data.duration,
        id_album: data.id_album || undefined,
        audio_url: data.audio_url || undefined,
        artist_ids: collabArtists.map((a) => a.id_artist),
        _method: 'PUT',
      });
      router.push('/artist/songs');
    } catch (err: any) {
      setError('Failed to update song. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageLoading />;

  return (
    <>
      <Head>
        <title>Edit Song — Spotify for Artists</title>
      </Head>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Song</h1>

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
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
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
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withArtistAuth(EditSongPage);
