import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useToastStore } from '@/components/ui/Toast';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  birthday: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/users', data);
      addToast('Pendaftaran berhasil! Silakan login.', 'success');
      router.push('/login');
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError('Email sudah terdaftar atau data tidak valid.');
        addToast('Pendaftaran gagal: Email sudah terdaftar atau data tidak valid.', 'error');
      } else {
        setError('Terjadi kesalahan. Pastikan server berjalan.');
        addToast('Pendaftaran gagal. Terjadi kesalahan koneksi.', 'error');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up — Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black flex flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/general/logo.svg" className="w-10 h-10 shrink-0" alt="Spotify Logo" />
          <span className="text-2xl font-bold text-white tracking-tight">
            Spotify
          </span>
        </div>

        {/* Register Card */}
        <div className="w-full max-w-md bg-spotify-card rounded-xl p-8 shadow-2xl shadow-black/50">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Sign up for free
          </h1>
          <p className="text-sm text-spotify-muted text-center mb-8">
            Start listening with a free Spotify account
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Name *
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Your name"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Password *
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="Create a password"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Date of Birth
              </label>
              <input
                {...register('birthday')}
                type="date"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  placeholder="e.g. Indonesia"
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-spotify-green hover:bg-spotify-green-bright text-black font-bold rounded-full py-3 text-base transition-all duration-200 hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <hr className="flex-1 border-spotify-border" />
            <span className="text-sm text-spotify-muted">or</span>
            <hr className="flex-1 border-spotify-border" />
          </div>

          <p className="text-center text-spotify-muted text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-white font-semibold hover:text-spotify-green underline underline-offset-2 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
