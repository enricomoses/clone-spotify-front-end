import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserCircle } from 'lucide-react';
import { withArtistAuth } from '@/utils/withArtistAuth';
import { useArtistStore } from '@/stores/useArtistStore';
import api from '@/lib/axios';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToastStore } from '@/components/ui/Toast';

const editProfileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  bio: z.string().optional(),
  profile_picture: z.string().url('URL tidak valid').optional().or(z.literal('')),
  instagram: z.string().url('URL tidak valid').optional().or(z.literal('')),
  facebook: z.string().url('URL tidak valid').optional().or(z.literal('')),
  x: z.string().url('URL tidak valid').optional().or(z.literal('')),
  wikipedia: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

function EditArtistProfilePage() {
  const router = useRouter();
  const artist = useArtistStore((s) => s.artist);
  const setArtist = useArtistStore((s) => s.setArtist);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
  });

  const profilePicture = watch('profile_picture');

  useEffect(() => {
    if (artist) {
      reset({
        name: artist.name,
        bio: artist.bio || '',
        profile_picture: artist.profile_picture || '',
        instagram: artist.instagram || '',
        facebook: artist.facebook || '',
        x: artist.x || '',
        wikipedia: artist.wikipedia || '',
      });
    }
  }, [artist, reset]);

  const onSubmit = async (data: EditProfileForm) => {
    if (!artist) return;
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: data.name,
        bio: data.bio || undefined,
        profile_picture: data.profile_picture || undefined,
        instagram: data.instagram || undefined,
        facebook: data.facebook || undefined,
        x: data.x || undefined,
        wikipedia: data.wikipedia || undefined,
        _method: 'PUT',
      };

      const response = await api.post(`/artists/${artist.id_artist}`, payload);
      const updatedArtist = response.data.data || response.data;
      setArtist({ ...artist, ...updatedArtist });
      addToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Profile — Spotify for Artists</title>
      </Head>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-2">
              Profile Picture
            </label>
            <input type="hidden" {...register('profile_picture')} />
            <ImageUpload
              value={profilePicture}
              onChange={(url) => setValue('profile_picture', url, { shouldValidate: true })}
              folder="avatars"
            />
            {errors.profile_picture && (
              <p className="mt-1 text-xs text-red-400">{errors.profile_picture.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Artist Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Tell your story..."
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
            />
          </div>

          {/* Social Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">
              Social Links
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-spotify-muted mb-1">
                  Instagram
                </label>
                <input
                  {...register('instagram')}
                  type="url"
                  placeholder="https://instagram.com/yourname"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-spotify-muted mb-1">
                  Facebook
                </label>
                <input
                  {...register('facebook')}
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-spotify-muted mb-1">
                  X / Twitter
                </label>
                <input
                  {...register('x')}
                  type="url"
                  placeholder="https://x.com/yourhandle"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-spotify-muted mb-1">
                  Wikipedia
                </label>
                <input
                  {...register('wikipedia')}
                  type="url"
                  placeholder="https://en.wikipedia.org/wiki/YourName"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/artist/dashboard')}
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
              {isSubmitting ? 'Saving' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withArtistAuth(EditArtistProfilePage);
