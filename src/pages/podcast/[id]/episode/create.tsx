import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import api from '@/lib/axios';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToastStore } from '@/components/ui/Toast';

const createEpisodeSchema = z.object({
  title: z.string().min(1, 'Judul episode wajib diisi'),
  description: z.string().optional(),
  published_at: z.string().min(1, 'Tanggal publish wajib diisi'),
  duration: z.coerce.number().min(1, 'Durasi harus lebih dari 0 detik'),
  audio_url: z.string().url('Audio URL harus valid'),
  video_url: z.string().url('Video URL tidak valid').optional().or(z.literal('')),
  thumbnail_image: z.string().url('Thumbnail URL tidak valid').optional().or(z.literal('')),
});

type CreateEpisodeForm = z.infer<typeof createEpisodeSchema>;

function CreateEpisodePage() {
  const router = useRouter();
  const { id } = router.query; // podcast ID
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEpisodeForm>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: {
      published_at: new Date().toISOString().split('T')[0],
    },
  });

  const thumbnailImage = watch('thumbnail_image');

  const onSubmit = async (data: CreateEpisodeForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...data,
        id_podcast: id,
        video_url: data.video_url || undefined,
        thumbnail_image: data.thumbnail_image || undefined,
      };

      await api.post('/episodes', payload);
      addToast('Episode berhasil diunggah!', 'success');
      router.push(`/podcast/${id}`);
    } catch (err: any) {
      setError('Failed to create episode. Please try again.');
      addToast('Gagal mengunggah episode. Silakan coba lagi.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Episode — Spotify Clone</title>
      </Head>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Episode</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Episode title"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Episode description"
              rows={4}
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Published At */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Publish Date *
              </label>
              <input
                {...register('published_at')}
                type="date"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.published_at && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.published_at.message}
                </p>
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
                placeholder="e.g. 1800"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.duration && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Audio URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Audio URL *
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

          {/* Video URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Video URL (optional)
            </label>
            <input
              {...register('video_url')}
              type="url"
              placeholder="https://example.com/video.mp4"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
          </div>

          {/* Thumbnail Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Thumbnail Image (optional)
            </label>
            <input type="hidden" {...register('thumbnail_image')} />
            <ImageUpload
              value={thumbnailImage}
              onChange={(url) => setValue('thumbnail_image', url, { shouldValidate: true })}
              folder="episodes"
            />
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
              {isSubmitting ? 'Uploading...' : 'Upload Episode'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withAuth(CreateEpisodePage);
