import { useState } from 'react';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  Music2,
} from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import { ArtistConcertsSkeleton } from '@/components/ui/SkeletonCard';
import { formatDate } from '@/utils/formatDuration';
import type { Concert, Artist } from '@/types';
import api from '@/lib/axios';
import ArtistAutocomplete from '@/components/ui/ArtistAutocomplete';
import { useToastStore } from '@/components/ui/Toast';

const concertSchema = z.object({
  location: z.string().min(1, 'Lokasi wajib diisi'),
  location_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  event_at: z.string().min(1, 'Tanggal event wajib diisi'),
  ticket_url: z.string().url('URL tiket tidak valid'),
});

type ConcertForm = z.infer<typeof concertSchema>;

function ArtistConcertsPage() {
  const artist = useArtistStore((s) => s.artist);
  const addToast = useToastStore((s) => s.addToast);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Collaborating artists for concert creation
  const [collabArtists, setCollabArtists] = useState<Artist[]>(() =>
    artist ? [artist] : []
  );

  const { data: concerts, isLoading } = useSWR<Concert[]>(
    artist ? `/artists/${artist.id_artist}/concerts` : null,
    fetcher,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConcertForm>({
    resolver: zodResolver(concertSchema),
  });

  const handleAddArtist = (a: Artist) => {
    setCollabArtists((prev) => [...prev, a]);
  };

  const handleRemoveArtist = (artistId: string) => {
    setCollabArtists((prev) => prev.filter((a) => a.id_artist !== artistId));
  };

  const onSubmit = async (data: ConcertForm) => {
    if (!artist) return;
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/concerts', {
        ...data,
        location_url: data.location_url || null,
        artist_ids: collabArtists.map((a) => a.id_artist),
      });
      mutate(`/artists/${artist.id_artist}/concerts`);
      addToast('Concert added successfully!', 'success');
      reset();
      setCollabArtists(artist ? [artist] : []);
      setShowForm(false);
    } catch (err: any) {
      setError('Failed to create concert. Try again.');
      addToast('Failed to add concert. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (concertId: string) => {
    if (!artist) return;
    if (!confirm('Delete this concert?')) return;
    setDeletingId(concertId);
    try {
      await api.post(`/concerts/${concertId}`, { _method: 'DELETE' });
      mutate(`/artists/${artist.id_artist}/concerts`);
      addToast('Concert deleted successfully!', 'success');
    } catch (e) {
      console.error('Failed to delete concert', e);
      addToast('Failed to delete concert. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <ArtistConcertsSkeleton />;

  const allConcerts = concerts || [];
  const now = new Date();
  const upcoming = allConcerts.filter((c) => new Date(c.event_at) > now);
  const past = allConcerts.filter((c) => new Date(c.event_at) <= now);

  return (
    <>
      <Head>
        <title>Concerts — Spotify for Artists</title>
      </Head>

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Concerts</h1>
            <p className="text-sm text-spotify-muted mt-1">
              {allConcerts.length} total concerts
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Close' : 'Add Concert'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">New Concert</h2>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">
                    Location *
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    placeholder="e.g. Jakarta Convention Center"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all"
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.location.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">
                    Event Date *
                  </label>
                  <input
                    {...register('event_at')}
                    type="datetime-local"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green transition-all"
                  />
                  {errors.event_at && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.event_at.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">
                    Location URL
                  </label>
                  <input
                    {...register('location_url')}
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">
                    Ticket URL *
                  </label>
                  <input
                    {...register('ticket_url')}
                    type="url"
                    placeholder="https://tickets.example.com"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all"
                  />
                  {errors.ticket_url && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.ticket_url.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Collaborating Artists */}
              <ArtistAutocomplete
                selectedArtists={collabArtists}
                onAdd={handleAddArtist}
                onRemove={handleRemoveArtist}
                lockedArtistId={artist?.id_artist}
                label="Performing Artists"
                placeholder="Search artists to add to concert..."
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-spotify-green text-black font-bold rounded-full text-sm hover:bg-spotify-green-bright transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Concert'}
              </button>
            </form>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-spotify-green" />
              Upcoming ({upcoming.length})
            </h2>
            <div className="space-y-3">
              {upcoming.map((concert) => (
                <div
                  key={concert.id_concert}
                  className="bg-spotify-card/50 border border-spotify-border/20 rounded-lg p-4 hover:bg-spotify-card transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-spotify-green/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-spotify-green" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {concert.location}
                        </p>
                        <p className="text-xs text-spotify-muted">
                          {formatDate(concert.event_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-spotify-green/20 text-spotify-green text-[10px] font-bold rounded-full">
                        Upcoming
                      </span>
                      <a
                        href={concert.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-spotify-muted hover:text-white transition-colors"
                        title="Ticket URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(concert.id_concert)}
                        disabled={deletingId === concert.id_concert}
                        className="p-2 text-spotify-muted hover:text-red-400 transition-colors"
                      >
                        {deletingId === concert.id_concert ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Collaborating Artists */}
                  {concert.artists && concert.artists.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-semibold text-spotify-muted tracking-wider">
                        Artists:
                      </span>
                      {concert.artists.map((a) => (
                        <span
                          key={a.id_artist}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-xs text-white"
                        >
                          <span className="w-4 h-4 rounded-full overflow-hidden bg-spotify-hover shrink-0">
                            {a.profile_picture ? (
                              <img
                                src={a.profile_picture}
                                alt={a.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center">
                                <Music2 className="w-2.5 h-2.5 text-spotify-muted" />
                              </span>
                            )}
                          </span>
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-spotify-muted mb-4">
              Past ({past.length})
            </h2>
            <div className="space-y-2 opacity-60">
              {past.map((concert) => (
                <div
                  key={concert.id_concert}
                  className="bg-spotify-card/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-spotify-muted" />
                      <div>
                        <p className="text-sm text-white">{concert.location}</p>
                        <p className="text-xs text-spotify-muted">
                          {formatDate(concert.event_at)}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-white/5 text-spotify-muted text-[10px] font-bold rounded-full">
                      Ended
                    </span>
                  </div>
                  {/* Collaborating Artists */}
                  {concert.artists && concert.artists.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-semibold text-spotify-muted tracking-wider">
                        Artists:
                      </span>
                      {concert.artists.map((a) => (
                        <span
                          key={a.id_artist}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full text-[11px] text-spotify-muted"
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {allConcerts.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center min-h-[30vh]">
            <Calendar className="w-12 h-12 text-spotify-muted/30 mb-3" />
            <p className="text-sm text-spotify-muted">
              No concerts yet. Create your first concert!
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default withArtistAuth(ArtistConcertsPage);
