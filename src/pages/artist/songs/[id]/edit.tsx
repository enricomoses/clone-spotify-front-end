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
import { GridSkeleton, SongFormSkeleton } from '@/components/ui/SkeletonCard';
import type { Song, Album, Artist } from '@/types';
import ArtistAutocomplete from '@/components/ui/ArtistAutocomplete';
import AudioUpload from '@/components/ui/AudioUpload';
import { useToastStore } from '@/components/ui/Toast';

const editSongSchema = z.object({
  title: z.string().min(1, 'Judul lagu wajib diisi'),
  id_album: z.string().optional(),
});

type EditSongForm = z.infer<typeof editSongSchema>;

function EditSongPage() {
  const router = useRouter();
  const { id } = router.query;
  const artist = useArtistStore((s) => s.artist);
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio upload state
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);

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
        id_album: song.id_album || '',
      });
      // Pre-fill audio state
      setAudioUrl(song.audio_url || '');
      setAudioDuration(song.duration || 0);
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

  const handleAudioChange = (url: string, duration: number) => {
    setAudioUrl(url);
    setAudioDuration(duration);
  };

  const onSubmit = async (data: EditSongForm) => {
    if (!audioUrl) {
      setError('Please upload an audio file first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/songs/${id}`, {
        title: data.title,
        duration: Math.round(audioDuration),
        id_album: data.id_album || null,
        audio_url: audioUrl,
        artist_ids: collabArtists.map((a) => a.id_artist),
        _method: 'PUT',
      });
      addToast('Song updated successfully!', 'success');
      router.push('/artist/songs');
    } catch (err: any) {
      setError('Failed to update song. Please try again.');
      addToast('Failed to update song. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Format duration for display */
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <SongFormSkeleton />;

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

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Audio File *
            </label>
            <AudioUpload
              value={audioUrl}
              onChange={handleAudioChange}
              folder="songs"
            />
            {audioDuration > 0 && (
              <p className="mt-2 text-xs text-spotify-muted">
                Durasi: <span className="text-white font-medium">{formatDuration(audioDuration)}</span>
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
