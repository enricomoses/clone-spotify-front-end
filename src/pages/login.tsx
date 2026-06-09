import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Music2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      // Server-side auth: mengirim email dan password ke endpoint /login
      const response = await api.post('/login', {
        email: data.email,
        password: data.password,
      });

      // Mengambil data user dari response backend Laravel
      const userData = response.data.data || response.data.user || response.data;
      const token = response.data.access_token || response.data.token;

      // Menyimpan token ke localStorage agar bisa digunakan untuk request API selanjutnya
      if (token) {
        localStorage.setItem('token', token);
      }

      // Memasukkan data user ke dalam state management (Zustand)
      setUser(userData);

      // Cek redirect setelah login (dari guest mode)
      const redirectTo = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectTo || '/home');
    } catch (err: any) {
      // Menangkap error 401 Unauthorized (Email/Password salah) dari Laravel
      if (err.response && err.response.status === 401) {
        setError('Email atau password salah');
      } else {
        setError('Terjadi kesalahan. Pastikan server berjalan.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login — Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
            <Music2 className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Spotify
          </span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-spotify-card rounded-xl p-8 shadow-2xl shadow-black/50">
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Log in to Spotify
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="Password"
                className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-spotify-green hover:bg-spotify-green-bright text-black font-bold rounded-full py-3 text-base transition-all duration-200 hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <hr className="flex-1 border-spotify-border" />
            <span className="text-sm text-spotify-muted">or</span>
            <hr className="flex-1 border-spotify-border" />
          </div>

          {/* Register Link */}
          <p className="text-center text-spotify-muted text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-white font-semibold hover:text-spotify-green underline underline-offset-2 transition-colors"
            >
              Sign up for Spotify
            </Link>
          </p>

          {/* Artist Login Link */}
          <p className="text-center text-spotify-muted text-xs mt-4">
            Are you an artist?{' '}
            <Link
              href="/artist/login"
              className="text-spotify-green hover:text-spotify-green-bright underline underline-offset-2 transition-colors"
            >
              Login to Spotify for Artists
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
