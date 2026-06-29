import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mic, Loader2, ArrowLeft } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/components/ui/Toast';
import type { PodcastCategory } from '@/types';
import api from '@/lib/axios';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';

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
    if (!user) return;
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/podcasts', {
        name: data.name,
        about: data.about || null,
        cover_image: data.cover_image || null,
        id_podcast_category: data.id_podcast_category || null,
        id_user: user.id_user,
      });
      addToast('Podcast created successfully!', 'success');
      router.push('/my-podcasts');
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError('Invalid data. Please check your input.');
        addToast('Invalid data. Please check your input.', 'error');
      } else {
        setError('Failed to create podcast. Try again.');
        addToast('Failed to create podcast. Try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create New Podcast — Spotify Clone</title>
      </Head>

      <div className="px-6 pb-8 max-w-2xl mx-auto">
        <div className="pt-4 mb-8">
          <Link
            href="/my-podcasts"
            className="flex items-center gap-2 text-sm text-spotify-muted hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Podcasts
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Mic className="w-8 h-8 text-spotify-green" />
            Create New Podcast
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Podcast Name *
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Your podcast name"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              About
            </label>
            <textarea
              {...register('about')}
              placeholder="Podcast description..."
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
              <p className="mt-1 text-xs text-red-400">{errors.cover_image.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Category
            </label>
            <select
              {...register('id_podcast_category')}
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            >
              <option value="">Select category (optional)</option>
              {categories?.map((cat) => (
                <option key={cat.id_podcast_category} value={cat.id_podcast_category}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-spotify-green hover:bg-spotify-green-bright text-black font-bold rounded-full py-3 text-base transition-all duration-200 hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Podcast'}
          </button>
        </form>
      </div>
    </>
  );
}

export default withAuth(CreatePodcastPage);
