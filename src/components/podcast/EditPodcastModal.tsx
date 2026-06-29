import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import type { Podcast, PodcastCategory } from '@/types';

const editPodcastSchema = z.object({
  name: z.string().min(1, 'Podcast name is required'),
  about: z.string().optional(),
  cover_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  id_podcast_category: z.string().optional(),
});

type EditPodcastForm = z.infer<typeof editPodcastSchema>;

interface EditPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: Podcast;
  onSuccess: () => void;
}

export default function EditPodcastModal({
  isOpen,
  onClose,
  podcast,
  onSuccess,
}: EditPodcastModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: categories } = useSWR<PodcastCategory[]>(
    '/podcast-categories',
    fetcher
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditPodcastForm>({
    resolver: zodResolver(editPodcastSchema),
  });

  const coverImage = watch('cover_image');

  // Populate form when podcast changes or modal opens
  useEffect(() => {
    if (isOpen && podcast) {
      reset({
        name: podcast.name,
        about: podcast.about || '',
        cover_image: podcast.cover_image || '',
        id_podcast_category: podcast.id_podcast_category || '',
      });
      setError('');
    }
  }, [isOpen, podcast, reset]);

  const onSubmit = async (data: EditPodcastForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/podcasts/${podcast.id_podcast}`, {
        name: data.name,
        about: data.about || null,
        cover_image: data.cover_image || null,
        id_podcast_category: data.id_podcast_category || null,
        id_user: podcast.id_user,
        _method: 'PUT',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Failed to update podcast. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Podcast" size="md">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Podcast Name *
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Podcast name"
            className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            About
          </label>
          <textarea
            {...register('about')}
            placeholder="Podcast description..."
            rows={3}
            className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Cover Image
          </label>
          <input type="hidden" {...register('cover_image')} />
          <ImageUpload
            value={coverImage}
            onChange={(url) =>
              setValue('cover_image', url, { shouldValidate: true })
            }
            folder="podcasts"
          />
          {errors.cover_image && (
            <p className="mt-1 text-xs text-red-400">
              {errors.cover_image.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Category
          </label>
          <select
            {...register('id_podcast_category')}
            className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
          >
            <option value="">Select category (optional)</option>
            {categories?.map((cat) => (
              <option key={cat.id_podcast_category} value={cat.id_podcast_category}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-bold bg-spotify-green hover:bg-spotify-green-bright text-black rounded-full transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
