import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Edit3, Trash2, Loader2, Mic, Play } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { PageLoading } from '@/components/ui/Spinner';
import { formatDuration, formatDate } from '@/utils/formatDuration';
import type { Podcast, Episode } from '@/types';
import api from '@/lib/axios';
import Link from 'next/link';

const episodeSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  published_at: z.string().min(1, 'Tanggal publish wajib diisi'),
  duration: z.coerce.number().min(1, 'Durasi minimal 1 detik'),
  audio_url: z.string().url('URL audio tidak valid'),
  video_url: z.string().url('URL video tidak valid').optional().or(z.literal('')),
  thumbnail_image: z.string().url('URL thumbnail tidak valid').optional().or(z.literal('')),
});

type EpisodeForm = z.infer<typeof episodeSchema>;

function PodcastEpisodesPage() {
  const router = useRouter();
  const { podcastId } = router.query;
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: podcast, isLoading } = useSWR<Podcast>(
    podcastId ? `/podcasts/${podcastId}` : null,
    fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EpisodeForm>({
    resolver: zodResolver(episodeSchema),
  });

  const onSubmit = async (data: EpisodeForm) => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/episodes', {
        ...data,
        video_url: data.video_url || null,
        thumbnail_image: data.thumbnail_image || null,
        id_podcast: podcastId,
      });
      mutate(`/podcasts/${podcastId}`);
      reset();
      setShowForm(false);
    } catch (err: any) {
      setError('Gagal menambahkan episode. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (episodeId: string) => {
    if (!confirm('Hapus episode ini?')) return;
    setDeletingId(episodeId);
    try {
      await api.delete(`/episodes/${episodeId}`);
      mutate(`/podcasts/${podcastId}`);
    } catch (e) {
      console.error('Failed to delete episode', e);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || !podcast) return <PageLoading />;

  const episodes = podcast.episodes || [];

  return (
    <>
      <Head>
        <title>{podcast.name} — Episodes — Spotify Clone</title>
      </Head>

      <div className="px-6 pb-8 max-w-4xl mx-auto">
        <div className="pt-4 mb-8">
          <Link
            href="/my-podcasts"
            className="flex items-center gap-2 text-sm text-spotify-muted hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Podcast Saya
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-spotify-card overflow-hidden shrink-0">
              {podcast.cover_image ? (
                <img src={podcast.cover_image} alt={podcast.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-600 to-spotify-dark flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white/60" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{podcast.name}</h1>
              <p className="text-sm text-spotify-muted">{episodes.length} episodes</p>
            </div>
          </div>
        </div>

        {/* Add Episode Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Tutup Form' : 'Upload Episode Baru'}
          </button>
        </div>

        {/* Episode Form */}
        {showForm && (
          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Upload Episode Baru</h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Title *</label>
                  <input {...register('title')} type="text" placeholder="Judul episode"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all" />
                  {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Published At *</label>
                  <input {...register('published_at')} type="datetime-local"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green transition-all" />
                  {errors.published_at && <p className="mt-1 text-xs text-red-400">{errors.published_at.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Description</label>
                <textarea {...register('description')} placeholder="Deskripsi episode..." rows={3}
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Duration (seconds) *</label>
                  <input {...register('duration')} type="number" placeholder="e.g. 1800"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all" />
                  {errors.duration && <p className="mt-1 text-xs text-red-400">{errors.duration.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Audio URL *</label>
                  <input {...register('audio_url')} type="url" placeholder="https://..."
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all" />
                  {errors.audio_url && <p className="mt-1 text-xs text-red-400">{errors.audio_url.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Video URL</label>
                  <input {...register('video_url')} type="url" placeholder="https://... (opsional)"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Thumbnail URL</label>
                  <input {...register('thumbnail_image')} type="url" placeholder="https://... (opsional)"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="px-6 py-2.5 bg-spotify-green text-black font-bold rounded-full text-sm hover:bg-spotify-green-bright transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Uploading...' : 'Upload Episode'}
              </button>
            </form>
          </div>
        )}

        {/* Episodes List */}
        {episodes.length > 0 ? (
          <div className="space-y-3">
            {episodes.map((episode, idx) => (
              <div
                key={episode.id_episode}
                className="flex items-center gap-4 bg-spotify-card/30 hover:bg-spotify-card/60 rounded-lg p-4 transition-colors"
              >
                <span className="w-8 text-center text-sm font-bold text-spotify-muted">
                  {idx + 1}
                </span>
                <div className="w-12 h-12 rounded-md bg-spotify-card overflow-hidden shrink-0">
                  {episode.thumbnail_image ? (
                    <img src={episode.thumbnail_image} alt={episode.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-700 to-spotify-dark flex items-center justify-center">
                      <Play className="w-4 h-4 text-white/60" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{episode.title}</p>
                  <p className="text-xs text-spotify-muted">
                    {formatDate(episode.published_at)} • {formatDuration(episode.duration)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(episode.id_episode)}
                  disabled={deletingId === episode.id_episode}
                  className="p-2 text-spotify-muted hover:text-red-400 transition-colors"
                >
                  {deletingId === episode.id_episode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[30vh]">
            <Play className="w-12 h-12 text-spotify-muted/30 mb-3" />
            <p className="text-sm text-spotify-muted">Belum ada episode. Upload episode pertamamu!</p>
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(PodcastEpisodesPage);
