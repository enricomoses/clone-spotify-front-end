import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, ShieldAlert, KeyRound, UserRound, Globe2, Calendar } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToastStore } from '@/components/ui/Toast';

// Form Validation Schema using Zod
const editProfileSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nama wajib diisi')
      .max(100, 'Nama maksimal 100 karakter'),
    birthday: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const selectedDate = new Date(val);
          const today = new Date();
          // Reset hours to compare strictly by date
          today.setHours(0, 0, 0, 0);
          return selectedDate < today;
        },
        {
          message: 'Tanggal lahir harus sebelum hari ini',
        }
      ),
    gender: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    profile_picture: z
      .string()
      .url('URL gambar tidak valid')
      .optional()
      .or(z.literal(''))
      .nullable(),
    current_password: z.string().optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      // If new password is provided, current password is required
      if (data.password && data.password.trim() !== '') {
        return !!data.current_password && data.current_password.trim() !== '';
      }
      return true;
    },
    {
      message: 'Password lama harus diisi untuk mengubah password',
      path: ['current_password'],
    }
  )
  .refine(
    (data) => {
      // New password must be at least 6 characters if provided
      if (data.password && data.password.trim() !== '') {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: 'Password baru minimal 6 karakter',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      // Password must not match current_password if changing
      if (data.password && data.current_password) {
        return data.password !== data.current_password;
      }
      return true;
    },
    {
      message: 'Password baru tidak boleh sama dengan password lama',
      path: ['password'],
    }
  );

type EditProfileForm = z.infer<typeof editProfileSchema>;

// Helper to format Date string to YYYY-MM-DD for date input binding
const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

function EditProfilePage() {
  const router = useRouter();
  const { user, setUser, refreshUser } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load user data on mount/refresh
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        birthday: formatDateForInput(user.birthday),
        gender: user.gender || '',
        country: user.country || '',
        profile_picture: user.profile_picture || '',
        current_password: '',
        password: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditProfileForm) => {
    if (!user) return;
    setIsSubmitting(true);
    setError('');

    try {
      // Construct payload, filtering out empty fields where applicable
      const payload: Record<string, any> = {
        name: data.name,
        birthday: data.birthday || null,
        gender: data.gender || null,
        country: data.country || null,
        profile_picture: data.profile_picture || null,
        _method: 'PUT', // Laravel method spoofing
      };

      // Only attach password details if user is changing password
      if (data.password && data.password.trim() !== '') {
        payload.current_password = data.current_password;
        payload.password = data.password;
      }

      const response = await api.post(`/users/${user.id_user}`, payload);
      
      // Update local storage and Zustand state
      const updatedUser = response.data.data ?? response.data;
      setUser(updatedUser);
      
      // Clear password fields in form
      reset({
        ...data,
        current_password: '',
        password: '',
      });

      addToast('Profil berhasil diperbarui!', 'success');
      router.push('/profile');
    } catch (err: any) {
      console.error('Update profile error:', err);
      // Display Laravel custom validation messages or a generic fallback
      const errorMsg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.';
      setError(errorMsg);
      addToast('Gagal memperbarui profil', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Profile — Spotify Clone</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Navigation back */}
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-spotify-muted hover:text-white transition-colors text-sm font-semibold mb-6 sm:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Profil
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Title and Left Info */}
          <div className="w-full lg:w-1/3 space-y-4">
            <h1 className="text-3xl font-black text-white tracking-tight">Edit Profile</h1>
            <p className="text-sm text-spotify-muted">
              Kelola informasi akun Anda mulai dari nama tampilan, foto profil, preferensi regional, hingga keamanan kata sandi Anda.
            </p>
            <div className="p-4 bg-spotify-card/30 border border-spotify-border/40 rounded-lg text-xs text-spotify-muted space-y-2">
              <span className="font-semibold text-white block">Catatan Akun:</span>
              <p>• Alamat email terdaftar bersifat permanen dan tidak dapat diubah demi alasan keamanan.</p>
              <p>• Perubahan gambar profil akan langsung disinkronkan ke seluruh aplikasi.</p>
            </div>
          </div>

          {/* Form container */}
          <div className="flex-1 w-full bg-spotify-card/40 border border-spotify-border/50 rounded-xl p-5 sm:p-8 backdrop-blur-md">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex gap-3 text-sm animate-fade-in">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="space-y-3 pb-6 border-b border-spotify-border/40">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-spotify-green animate-pulse" />
                  Foto Profil
                </h3>
                <p className="text-xs text-spotify-muted">
                  Sesuaikan tampilan avatar Anda. Disarankan gambar dengan rasio 1:1.
                </p>
                <div className="pt-2">
                  <input type="hidden" {...register('profile_picture')} />
                  <ImageUpload
                    value={profilePicture || ''}
                    onChange={(url) => setValue('profile_picture', url, { shouldValidate: true })}
                    folder="avatars"
                  />
                  {errors.profile_picture && (
                    <p className="mt-1.5 text-xs text-red-400 font-semibold">
                      {errors.profile_picture.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="space-y-5 pb-6 border-b border-spotify-border/40">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-spotify-green" />
                  Informasi Pribadi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-spotify-muted mb-2">
                      Nama Tampilan *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-spotify-hover hover:bg-spotify-border/50 focus:bg-spotify-hover border border-spotify-border/80 focus:border-spotify-green rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-spotify-green transition-all"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-spotify-muted mb-2">
                      Tanggal Lahir
                    </label>
                    <div className="relative">
                      <input
                        {...register('birthday')}
                        type="date"
                        className="w-full bg-spotify-hover hover:bg-spotify-border/50 focus:bg-spotify-hover border border-spotify-border/80 focus:border-spotify-green rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-spotify-green transition-all appearance-none"
                      />
                    </div>
                    {errors.birthday && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.birthday.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-spotify-muted mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full bg-spotify-hover hover:bg-spotify-border/50 focus:bg-spotify-hover border border-spotify-border/80 focus:border-spotify-green rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-spotify-green transition-all"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                      <option value="Lainnya">Lainnya</option>
                      <option value="Tidak ingin menyebutkan">Tidak ingin menyebutkan</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-spotify-muted mb-2">
                      Negara / Wilayah
                    </label>
                    <input
                      {...register('country')}
                      type="text"
                      placeholder="Contoh: Indonesia"
                      className="w-full bg-spotify-hover hover:bg-spotify-border/50 focus:bg-spotify-hover border border-spotify-border/80 focus:border-spotify-green rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-spotify-green transition-all"
                    />
                    {errors.country && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password update section */}
              <div className="space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-spotify-green" />
                  Ubah Kata Sandi
                </h3>
                <p className="text-xs text-spotify-muted">
                  Biarkan kosong jika Anda tidak ingin mengubah kata sandi akun Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-spotify-muted mb-2">
                      Kata Sandi Saat Ini
                    </label>
                    <input
                      {...register('current_password')}
                      type="password"
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi lama"
                      className="w-full bg-spotify-hover hover:bg-spotify-border/50 focus:bg-spotify-hover border border-spotify-border/80 focus:border-spotify-green rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-spotify-green transition-all"
                    />
                    {errors.current_password && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.current_password.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-spotify-muted mb-2">
                      Kata Sandi Baru
                    </label>
                    <input
                      {...register('password')}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                      className="w-full bg-spotify-hover hover:bg-spotify-border/50 focus:bg-spotify-hover border border-spotify-border/80 focus:border-spotify-green rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-spotify-green transition-all"
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-spotify-border/40">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="btn-outline text-sm py-2.5 px-8 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-spotify text-sm py-2.5 px-8 font-bold flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(EditProfilePage);
