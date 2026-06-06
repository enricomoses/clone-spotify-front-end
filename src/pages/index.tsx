import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/useAuthStore';
import Head from 'next/head';

export default function LandingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <>
      <Head>
        <title>Spotify Clone — Music Streaming Platform</title>
      </Head>
      <div className="flex h-screen items-center justify-center bg-spotify-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-spotify-green border-t-transparent" />
      </div>
    </>
  );
}
