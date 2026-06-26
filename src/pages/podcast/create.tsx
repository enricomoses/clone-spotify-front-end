import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import type { PodcastCategory } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToastStore } from '@/components/ui/Toast';

const createPodcastSchema = z.object({
  name: z.string().min(1, 'Podcast name is required'),
  about: z.string().optional(),
  cover_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  id_podcast_category: z.string().optional(),
});

type CreatePodcastForm = z.infer<typeof createPodcastSchema>;

function CreatePodcastPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useSWR<PodcastCategory[]>(
    '/podcast-categories',
    fetcher
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePodcastForm>({
    resolver: zodResolver(createPodcastSchema),
  });

  const coverImage = watch('cover_image');

  const onSubmit = async (data: CreatePodcastForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...data,
        id_user: user?.id_user,
        cover_image: data.cover_image || undefined,
        id_podcast_category: data.id_podcast_category || undefined,
      };

      const response = await api.post('/podcasts', payload);
      const newPodcast = response.data.data || response.data;
      addToast('Podcast created successfully!', 'success');
      router.push(`/podcast/${newPodcast.id_podcast}`);
    } catch (err: any) {
      setError('Failed to create podcast. Please try again.');
      addToast('Failed to create podcast. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Podcast — Spotify Clone</title>
      </Head>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Create Podcast</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Podcast Name *
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="My Awesome Podcast"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              About
            </label>
            <textarea
              {...register('about')}
              placeholder="What is your podcast about?"
              rows={4}
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
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
              folder="podcasts"
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
                {...register('id_podcast_category')}
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id_podcast_category}
                    value={cat.id_podcast_category}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {isSubmitting ? 'Creating...' : 'Create Podcast'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withAuth(CreatePodcastPage);
